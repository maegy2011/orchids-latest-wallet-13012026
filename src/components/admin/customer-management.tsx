"use client";

import { useState, useEffect } from "react";
import { 
  Users, 
  UserPlus, 
  Search, 
  MoreVertical, 
  ShieldCheck, 
  ShieldAlert, 
  Archive, 
  Key, 
  Mail, 
  History,
  MapPin,
  Phone,
  Briefcase,
  ExternalLink
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { format } from "date-fns";
import { ar } from "date-fns/locale";

interface Customer {
  id: string;
  name: string;
  trading_name: string;
  customer_type: 'individual' | 'company';
  email: string;
  mobile: string;
  governorate: string;
  city: string;
  street: string;
  account_status: 'active' | 'disabled' | 'archived';
  subscription_plan: string;
  subscription_end_date: string;
  created_at: string;
  last_login_at: string;
}

export function CustomerManagement() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [customerLogs, setCustomerLogs] = useState<any[]>([]);

  // Create Form State
  const [formData, setFormData] = useState({
    name: "",
    trading_name: "",
    customer_type: "individual",
    email: "",
    mobile: "",
    governorate: "",
    city: "",
    street: "",
    password: ""
  });

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      const res = await fetch("/api/admin/customers");
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setCustomers(data);
    } catch (error: any) {
      toast.error("خطأ في تحميل العملاء: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchCustomerDetails = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/customers/${id}`);
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setCustomerLogs(data.logs);
      setSelectedCustomer(data.profile);
    } catch (error: any) {
      toast.error("خطأ في تحميل تفاصيل العميل");
    }
  };

  const handleCreateCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/admin/customers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      
      toast.success("تم إنشاء حساب العميل بنجاح مع باقة تجريبية لمدة 7 أيام");
      setIsCreateOpen(false);
      setFormData({
        name: "", trading_name: "", customer_type: "individual",
        email: "", mobile: "", governorate: "", city: "", street: "",
        password: ""
      });
      fetchCustomers();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleStatusChange = async (id: string, status: string) => {
    try {
      const res = await fetch(`/api/admin/customers/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ account_status: status })
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      
      toast.success(`تم ${status === 'active' ? 'تفعيل' : status === 'disabled' ? 'تعطيل' : 'أرشفة'} الحساب`);
      fetchCustomers();
      if (selectedCustomer?.id === id) fetchCustomerDetails(id);
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleManualPasswordReset = async (id: string) => {
    const newPassword = prompt("أدخل كلمة المرور الجديدة (سيُطلب من العميل تغييرها عند الدخول):");
    if (!newPassword) return;

    try {
      const res = await fetch(`/api/admin/customers/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "reset_password_manual", password: newPassword })
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      toast.success("تم تحديث كلمة المرور بنجاح");
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleSendResetLink = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/customers/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "send_reset_link" })
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      toast.success("تم إنشاء رابط استعادة كلمة المرور");
      if (data.link) {
        console.log("Reset Link:", data.link);
        alert(`رابط الاستعادة: ${data.link}`);
      }
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.mobile.includes(searchQuery) ||
    c.trading_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Users className="w-6 h-6 text-primary" />
            إدارة العملاء
          </h2>
          <p className="text-sm text-zinc-500">إدارة حسابات العملاء، الاشتراكات، والنشاط</p>
        </div>

        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <UserPlus className="w-4 h-4" />
              إنشاء حساب عميل جديد
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>إنشاء حساب عميل جديد</DialogTitle>
              <DialogDescription>
                سيتم منح العميل باقة برو تجريبية لمدة 7 أيام تلقائياً.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateCustomer} className="space-y-4 py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>اسم العميل</Label>
                  <Input 
                    required 
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                    placeholder="الاسم الثلاثي"
                  />
                </div>
                <div className="space-y-2">
                  <Label>الاسم التجاري</Label>
                  <Input 
                    value={formData.trading_name}
                    onChange={e => setFormData({...formData, trading_name: e.target.value})}
                    placeholder="اسم المحل أو الشركة"
                  />
                </div>
                <div className="space-y-2">
                  <Label>نوع العميل</Label>
                  <Select 
                    value={formData.customer_type}
                    onValueChange={v => setFormData({...formData, customer_type: v})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="individual">فرد</SelectItem>
                      <SelectItem value="company">شركة</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>العملة</Label>
                  <Input disabled value="جنيه مصري (EGP)" />
                </div>
                <div className="space-y-2">
                  <Label>البريد الإلكتروني</Label>
                  <Input 
                    required 
                    type="email"
                    value={formData.email}
                    onChange={e => setFormData({...formData, email: e.target.value})}
                    placeholder="example@mail.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label>رقم الموبايل</Label>
                  <Input 
                    required 
                    value={formData.mobile}
                    onChange={e => setFormData({...formData, mobile: e.target.value})}
                    placeholder="01xxxxxxxxx"
                  />
                </div>
                <div className="space-y-2">
                  <Label>كلمة المرور الأولية</Label>
                  <Input 
                    required 
                    type="password"
                    value={formData.password}
                    onChange={e => setFormData({...formData, password: e.target.value})}
                    placeholder="********"
                  />
                </div>
              </div>
              
              <div className="space-y-3 pt-2">
                <h4 className="font-bold text-sm border-b pb-1">العنوان</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="space-y-2">
                    <Label>المحافظة</Label>
                    <Input 
                      value={formData.governorate}
                      onChange={e => setFormData({...formData, governorate: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>المدينة</Label>
                    <Input 
                      value={formData.city}
                      onChange={e => setFormData({...formData, city: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>الشارع</Label>
                    <Input 
                      value={formData.street}
                      onChange={e => setFormData({...formData, street: e.target.value})}
                    />
                  </div>
                </div>
              </div>

              <DialogFooter className="mt-6">
                <Button type="submit" className="w-full">إنشاء الحساب</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex items-center gap-2 bg-white dark:bg-zinc-900 p-2 rounded-lg border">
        <Search className="w-5 h-5 text-zinc-400 mr-2" />
        <Input 
          placeholder="بحث بالاسم، البريد، أو الموبايل..." 
          className="border-none focus-visible:ring-0"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
        />
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-right border-collapse">
              <thead>
                <tr className="bg-zinc-50 dark:bg-zinc-800 border-b">
                  <th className="p-4 text-sm font-bold">العميل</th>
                  <th className="p-4 text-sm font-bold">الحالة</th>
                  <th className="p-4 text-sm font-bold">الاشتراك</th>
                  <th className="p-4 text-sm font-bold">آخر دخول</th>
                  <th className="p-4 text-sm font-bold"></th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {loading ? (
                  <tr><td colSpan={5} className="p-8 text-center">جاري التحميل...</td></tr>
                ) : filteredCustomers.length === 0 ? (
                  <tr><td colSpan={5} className="p-8 text-center text-zinc-500">لا يوجد عملاء مطابقين للبحث</td></tr>
                ) : (
                  filteredCustomers.map(customer => (
                    <tr key={customer.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors">
                      <td className="p-4">
                        <div className="font-bold">{customer.name}</div>
                        <div className="text-xs text-zinc-500">{customer.trading_name || 'فرد'} • {customer.email}</div>
                      </td>
                      <td className="p-4">
                          <Badge className={
                            customer.account_status === 'active' ? 'bg-emerald-100 text-emerald-700' : 
                            customer.account_status === 'disabled' ? 'bg-rose-100 text-rose-700' : 'bg-zinc-100 text-zinc-700'
                          }>
                            {customer.account_status === 'active' ? 'مفعل' : 
                             customer.account_status === 'disabled' ? 'معطل' : 'مؤرشف'}
                          </Badge>
                        </td>
                        <td className="p-4">
                          <div className="text-sm font-medium">
                            {customer.subscription_plan === 'pro' ? 'برو (احترافي)' : 'مجاني'}
                          </div>
                          <div className="text-[10px] text-zinc-500">
                            {customer.subscription_end_date 
                              ? `حتى ${format(new Date(customer.subscription_end_date), 'dd/MM/yyyy')}` 
                              : 'بدون تاريخ انتهاء'}
                          </div>
                        </td>
                        <td className="p-4 text-sm text-zinc-500">
                          {customer.last_login_at 
                            ? format(new Date(customer.last_login_at), 'dd/MM HH:mm', { locale: ar })
                            : 'لم يدخل بعد'}
                        </td>
                        <td className="p-4">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreVertical className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-56">
                              <DropdownMenuLabel>إجراءات العميل</DropdownMenuLabel>
                              <DropdownMenuItem onClick={() => fetchCustomerDetails(customer.id)}>
                                <ExternalLink className="w-4 h-4 ml-2" />
                                عرض التفاصيل والنشاط
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => handleManualPasswordReset(customer.id)}>
                                <Key className="w-4 h-4 ml-2" />
                                إعادة تعيين كلمة المرور يدوياً
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleSendResetLink(customer.id)}>
                                <Mail className="w-4 h-4 ml-2" />
                                إرسال رابط إعادة تعيين
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              {customer.account_status !== 'active' && (
                                <DropdownMenuItem onClick={() => handleStatusChange(customer.id, 'active')}>
                                  <ShieldCheck className="w-4 h-4 ml-2 text-emerald-500" />
                                  تفعيل الحساب
                                </DropdownMenuItem>
                              )}
                              {customer.account_status === 'active' && (
                                <DropdownMenuItem onClick={() => handleStatusChange(customer.id, 'disabled')}>
                                  <ShieldAlert className="w-4 h-4 ml-2 text-amber-500" />
                                  تعطيل الحساب
                                </DropdownMenuItem>
                              )}
                              {customer.account_status !== 'archived' && (
                                <DropdownMenuItem className="text-rose-600" onClick={() => handleStatusChange(customer.id, 'archived')}>
                                  <Archive className="w-4 h-4 ml-2" />
                                  أرشفة الحساب
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
  
        {/* Customer Details Sheet/Dialog */}
        <Dialog open={!!selectedCustomer} onOpenChange={() => setSelectedCustomer(null)}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden flex flex-col p-0">
            <div className="p-6 overflow-y-auto">
              <DialogHeader className="mb-6">
                <div className="flex justify-between items-start">
                  <div>
                    <DialogTitle className="text-2xl">{selectedCustomer?.name}</DialogTitle>
                    <DialogDescription className="flex items-center gap-2 mt-1">
                      <Badge variant="outline">{selectedCustomer?.id}</Badge>
                      <span className="text-xs text-zinc-400">UUID الحساب</span>
                    </DialogDescription>
                  </div>
                  <Badge className={`text-lg px-4 py-1 ${selectedCustomer?.account_status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                    {selectedCustomer?.account_status === 'active' ? 'نشط' : 'غير نشط'}
                  </Badge>
                </div>
              </DialogHeader>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="font-bold border-b pb-2 flex items-center gap-2">
                  <Briefcase className="w-4 h-4" /> البيانات الأساسية
                </h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between border-b border-zinc-100 pb-1">
                    <span className="text-zinc-500">الاسم التجاري</span>
                    <span className="font-medium">{selectedCustomer?.trading_name || 'غير محدد'}</span>
                  </div>
                  <div className="flex justify-between border-b border-zinc-100 pb-1">
                    <span className="text-zinc-500">نوع العميل</span>
                    <span className="font-medium">{selectedCustomer?.customer_type === 'individual' ? 'فرد' : 'شركة'}</span>
                  </div>
                  <div className="flex justify-between border-b border-zinc-100 pb-1">
                    <span className="text-zinc-500">البريد الإلكتروني</span>
                    <span className="font-medium">{selectedCustomer?.email}</span>
                  </div>
                  <div className="flex justify-between border-b border-zinc-100 pb-1">
                    <span className="text-zinc-500">الموبايل</span>
                    <span className="font-medium font-mono">{selectedCustomer?.mobile}</span>
                  </div>
                  <div className="flex justify-between border-b border-zinc-100 pb-1">
                    <span className="text-zinc-500">العملة</span>
                    <span className="font-medium">جنيه مصري (EGP)</span>
                  </div>
                  <div className="flex justify-between border-b border-zinc-100 pb-1">
                    <span className="text-zinc-500">تاريخ الإنشاء</span>
                    <span className="font-medium">{selectedCustomer?.created_at && format(new Date(selectedCustomer.created_at), 'dd/MM/yyyy HH:mm')}</span>
                  </div>
                </div>

                <h3 className="font-bold border-b pb-2 flex items-center gap-2 pt-2">
                  <MapPin className="w-4 h-4" /> العنوان
                </h3>
                <div className="space-y-2 text-sm">
                  <p><span className="text-zinc-500">المحافظة:</span> {selectedCustomer?.governorate || '---'}</p>
                  <p><span className="text-zinc-500">المدينة:</span> {selectedCustomer?.city || '---'}</p>
                  <p><span className="text-zinc-500">الشارع:</span> {selectedCustomer?.street || '---'}</p>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-bold border-b pb-2 flex items-center gap-2">
                  <History className="w-4 h-4" /> سجل النشاط
                </h3>
                <ScrollArea className="h-[300px] w-full rounded-md border p-4">
                  <div className="space-y-4">
                    {customerLogs.length === 0 ? (
                      <div className="text-center text-zinc-500 py-8 text-xs">لا يوجد سجل نشاط متاح</div>
                    ) : (
                      customerLogs.map((log) => (
                        <div key={log.id} className="relative pr-4 border-r-2 border-zinc-100 pb-4 last:pb-0">
                          <div className="absolute top-0 -right-[5px] w-2 h-2 rounded-full bg-primary" />
                          <div className="text-xs font-bold text-zinc-700">
                            {log.action === 'account_created' ? 'إنشاء الحساب' :
                             log.action === 'password_reset_manual' ? 'تغيير كلمة المرور (أدمن)' :
                             log.action === 'reset_link_generated' ? 'إنشاء رابط استعادة' :
                             log.action === 'profile_updated' ? 'تحديث البيانات' : log.action}
                          </div>
                          <div className="text-[10px] text-zinc-400">
                            {format(new Date(log.created_at), 'dd/MM/yyyy HH:mm', { locale: ar })}
                          </div>
                          {log.metadata && Object.keys(log.metadata).length > 0 && (
                            <div className="text-[10px] bg-zinc-50 p-1 mt-1 rounded text-zinc-600 truncate">
                              {JSON.stringify(log.metadata)}
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </ScrollArea>
              </div>
            </div>
          </div>
          <div className="bg-zinc-50 p-4 border-t flex justify-end gap-3">
            <Button variant="outline" onClick={() => setSelectedCustomer(null)}>إغلاق</Button>
            <Button variant="default" onClick={() => handleManualPasswordReset(selectedCustomer!.id)}>إعادة تعيين كلمة المرور</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
