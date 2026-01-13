"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  FileText, 
  Plus, 
  Search, 
  Download, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Eye,
  Calendar,
  CreditCard,
  User,
  Package as PackageIcon,
  Clock
} from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { ar } from "date-fns/locale";

interface Invoice {
  id: string;
  customer_id: string;
  package_id: string;
  subscription_id: string;
  invoice_number: string;
  issue_date: string;
  due_date: string;
  amount_before_tax: number;
  tax_amount: number;
  total_amount: number;
  payment_method: string;
  payment_transaction_id: string;
  payment_reference: string;
  status: 'paid' | 'overdue' | 'cancelled' | 'pending';
  payment_date: string;
  receipt_url: string;
  created_at: string;
  profiles: { name: string; trading_name: string };
  packages: { name: string };
  subscriptions: { end_date: string };
}

export function InvoiceManagement() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  
  // Form state
  const [customers, setCustomers] = useState<any[]>([]);
  const [packages, setPackages] = useState<any[]>([]);
  const [newInvoice, setNewInvoice] = useState({
    customer_id: "",
    package_id: "",
    subscription_id: "",
    amount_before_tax: 0,
    tax_amount: 0,
    total_amount: 0,
    due_date: "",
    payment_method: "wallet_transfer"
  });

  useEffect(() => {
    fetchInvoices();
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    const { data: cust } = await supabase.from("profiles").select("id, name, trading_name");
    const { data: pkgs } = await supabase.from("packages").select("id, name, price");
    setCustomers(cust || []);
    setPackages(pkgs || []);
  };

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/admin/invoices");
      const data = await response.json();
      if (response.ok) {
        setInvoices(data);
      } else {
        toast.error("خطأ في تحميل الفواتير");
      }
    } catch (error) {
      toast.error("حدث خطأ ما");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateInvoice = async () => {
    try {
      // Calculate total if not set
      const total = Number(newInvoice.amount_before_tax) + Number(newInvoice.tax_amount);
      const invoiceNumber = `INV-${Date.now()}`;

      const response = await fetch("/api/admin/invoices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...newInvoice,
          total_amount: total,
          invoice_number: invoiceNumber,
          status: 'pending'
        }),
      });

      if (response.ok) {
        toast.success("تم إنشاء الفاتورة بنجاح");
        setIsCreateOpen(false);
        fetchInvoices();
      } else {
        const err = await response.json();
        toast.error(err.error || "فشل إنشاء الفاتورة");
      }
    } catch (error) {
      toast.error("حدث خطأ ما");
    }
  };

  const updateStatus = async (id: string, status: string) => {
    try {
      const response = await fetch(`/api/admin/invoices/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          status,
          payment_date: status === 'paid' ? new Date().toISOString() : null
        }),
      });

      if (response.ok) {
        toast.success("تم تحديث الحالة");
        fetchInvoices();
        if (selectedInvoice?.id === id) {
          setIsDetailsOpen(false);
        }
      } else {
        toast.error("فشل التحديث");
      }
    } catch (error) {
      toast.error("حدث خطأ ما");
    }
  };

  const filteredInvoices = invoices.filter(inv => 
    inv.invoice_number.toLowerCase().includes(search.toLowerCase()) ||
    inv.profiles?.name?.toLowerCase().includes(search.toLowerCase()) ||
    inv.profiles?.trading_name?.toLowerCase().includes(search.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid': return <span className="px-2 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold flex items-center gap-1"><CheckCircle className="w-3 h-3" /> مسددة</span>;
      case 'overdue': return <span className="px-2 py-1 rounded-full bg-rose-100 text-rose-700 text-xs font-bold flex items-center gap-1"><AlertCircle className="w-3 h-3" /> متأخرة</span>;
      case 'cancelled': return <span className="px-2 py-1 rounded-full bg-zinc-100 text-zinc-700 text-xs font-bold flex items-center gap-1"><XCircle className="w-3 h-3" /> ملغية</span>;
      default: return <span className="px-2 py-1 rounded-full bg-amber-100 text-amber-700 text-xs font-bold flex items-center gap-1"><Clock className="w-3 h-3" /> قيد الانتظار</span>;
    }
  };

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <FileText className="w-6 h-6 text-primary" />
          إدارة الفواتير والمدفوعات
        </h2>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              فاتورة جديدة
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>إنشاء فاتورة يدوية</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">العميل</label>
                <Select onValueChange={(val) => setNewInvoice({...newInvoice, customer_id: val})}>
                  <SelectTrigger>
                    <SelectValue placeholder="اختر العميل" />
                  </SelectTrigger>
                  <SelectContent>
                    {customers.map(c => (
                      <SelectItem key={c.id} value={c.id}>{c.trading_name || c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">الباقة</label>
                <Select onValueChange={(val) => {
                  const pkg = packages.find(p => p.id === val);
                  setNewInvoice({
                    ...newInvoice, 
                    package_id: val,
                    amount_before_tax: pkg?.price || 0,
                    tax_amount: (pkg?.price || 0) * 0.14
                  });
                }}>
                  <SelectTrigger>
                    <SelectValue placeholder="اختر الباقة" />
                  </SelectTrigger>
                  <SelectContent>
                    {packages.map(p => (
                      <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">المبلغ (قبل الضريبة)</label>
                  <Input 
                    type="number" 
                    value={newInvoice.amount_before_tax} 
                    onChange={(e) => setNewInvoice({...newInvoice, amount_before_tax: Number(e.target.value)})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">الضريبة (14%)</label>
                  <Input 
                    type="number" 
                    value={newInvoice.tax_amount} 
                    onChange={(e) => setNewInvoice({...newInvoice, tax_amount: Number(e.target.value)})}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">تاريخ الاستحقاق</label>
                <Input 
                  type="date" 
                  onChange={(e) => setNewInvoice({...newInvoice, due_date: e.target.value})}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateOpen(false)}>إلغاء</Button>
              <Button onClick={handleCreateInvoice}>إنشاء الفاتورة</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
              <Input 
                placeholder="بحث برقم الفاتورة أو اسم العميل..." 
                className="pr-10"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>رقم الفاتورة</TableHead>
                  <TableHead>العميل</TableHead>
                  <TableHead>الباقة</TableHead>
                  <TableHead>الإجمالي</TableHead>
                  <TableHead>تاريخ الاستحقاق</TableHead>
                  <TableHead>الحالة</TableHead>
                  <TableHead className="text-left">إجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-zinc-500">جاري التحميل...</TableCell>
                  </TableRow>
                ) : filteredInvoices.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-zinc-500">لا توجد فواتير</TableCell>
                  </TableRow>
                ) : (
                  filteredInvoices.map((inv) => (
                    <TableRow key={inv.id}>
                      <TableCell className="font-mono text-xs">{inv.invoice_number}</TableCell>
                      <TableCell className="font-medium">{inv.profiles?.trading_name || inv.profiles?.name}</TableCell>
                      <TableCell>{inv.packages?.name}</TableCell>
                      <TableCell className="font-bold">{inv.total_amount.toLocaleString()} ج.م</TableCell>
                      <TableCell className="text-xs">
                        {inv.due_date ? format(new Date(inv.due_date), 'dd/MM/yyyy') : '-'}
                      </TableCell>
                      <TableCell>{getStatusBadge(inv.status)}</TableCell>
                      <TableCell className="text-left">
                        <div className="flex justify-end gap-2">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => {
                              setSelectedInvoice(inv);
                              setIsDetailsOpen(true);
                            }}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          {inv.status !== 'paid' && (
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="text-emerald-600"
                              onClick={() => updateStatus(inv.id, 'paid')}
                            >
                              <CheckCircle className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Details Dialog */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="max-w-2xl overflow-y-auto max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="flex justify-between items-center pr-6">
              <span>تفاصيل الفاتورة {selectedInvoice?.invoice_number}</span>
              {selectedInvoice && getStatusBadge(selectedInvoice.status)}
            </DialogTitle>
          </DialogHeader>
          
          {selectedInvoice && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-zinc-100"><User className="w-4 h-4" /></div>
                  <div>
                    <div className="text-xs text-zinc-500">معلومات العميل</div>
                    <div className="font-bold">{selectedInvoice.profiles?.trading_name || selectedInvoice.profiles?.name}</div>
                    <div className="text-[10px] text-zinc-400 font-mono">{selectedInvoice.customer_id}</div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-zinc-100"><PackageIcon className="w-4 h-4" /></div>
                  <div>
                    <div className="text-xs text-zinc-500">الباقة والاشتراك</div>
                    <div className="font-bold">{selectedInvoice.packages?.name}</div>
                    <div className="text-[10px] text-zinc-400 font-mono">الباقة: {selectedInvoice.package_id}</div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-zinc-100"><Calendar className="w-4 h-4" /></div>
                  <div>
                    <div className="text-xs text-zinc-500">التواريخ</div>
                    <div className="text-sm">تاريخ الإصدار: {format(new Date(selectedInvoice.issue_date), 'dd/MM/yyyy')}</div>
                    <div className="text-sm text-rose-600">تاريخ الاستحقاق: {selectedInvoice.due_date ? format(new Date(selectedInvoice.due_date), 'dd/MM/yyyy') : '-'}</div>
                    <div className="text-sm text-emerald-600 font-bold">التجديد القادم: {selectedInvoice.subscriptions?.end_date ? format(new Date(selectedInvoice.subscriptions.end_date), 'dd/MM/yyyy') : '-'}</div>
                  </div>
                </div>
              </div>

              <div className="bg-zinc-50 p-4 rounded-xl space-y-4 border">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-zinc-500">المبلغ الصافي:</span>
                    <span>{selectedInvoice.amount_before_tax.toLocaleString()} ج.م</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-zinc-500">الضريبة (14%):</span>
                    <span>{selectedInvoice.tax_amount.toLocaleString()} ج.م</span>
                  </div>
                  <div className="border-t pt-2 flex justify-between font-bold text-lg">
                    <span>الإجمالي النهائي:</span>
                    <span className="text-primary">{selectedInvoice.total_amount.toLocaleString()} ج.م</span>
                  </div>
                </div>

                <div className="space-y-2 pt-2 border-t">
                  <div className="text-xs text-zinc-500">معلومات الدفع</div>
                  <div className="text-sm">الطريقة: تحويل محفظة</div>
                  <div className="text-sm">المرجع: {selectedInvoice.payment_reference || '-'}</div>
                  {selectedInvoice.payment_date && (
                    <div className="text-sm">تاريخ الدفع: {format(new Date(selectedInvoice.payment_date), 'dd/MM/yyyy HH:mm')}</div>
                  )}
                </div>

                {selectedInvoice.status !== 'paid' && (
                  <div className="flex flex-col gap-2 pt-2">
                    <Button className="w-full bg-emerald-600 hover:bg-emerald-700" onClick={() => updateStatus(selectedInvoice.id, 'paid')}>
                      تأكيد التحصيل (مسددة)
                    </Button>
                    <Button variant="outline" className="w-full text-rose-600 border-rose-200" onClick={() => updateStatus(selectedInvoice.id, 'overdue')}>
                      تعيين كمتأخرة
                    </Button>
                  </div>
                )}
              </div>
              
              {selectedInvoice.receipt_url && (
                <div className="col-span-full border-t pt-4">
                  <div className="text-sm font-bold mb-2">إيصال الدفع:</div>
                  <img src={selectedInvoice.receipt_url} alt="Receipt" className="max-w-full rounded-lg border shadow-sm" />
                  <Button variant="outline" size="sm" className="mt-2 gap-2" asChild>
                    <a href={selectedInvoice.receipt_url} target="_blank" rel="noreferrer">
                      <Download className="w-4 h-4" /> تحميل الإيصال
                    </a>
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
