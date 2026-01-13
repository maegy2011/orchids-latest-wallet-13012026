"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { 
  Bell, 
  Send, 
  History, 
  Search, 
  Filter,
  AlertTriangle,
  Clock,
  CheckCircle2,
  XCircle,
  Mail,
  MessageSquare
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

interface Message {
  id: string;
  profile_id: string;
  title: string;
  content: string;
  type: string;
  status: string;
  created_at: string;
  sent_at: string | null;
  metadata: any;
  profiles: {
    name: string;
    trading_name: string;
    email: string;
  };
}

export function CommunicationManagement() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [isSending, setIsSending] = useState(false);

  // New message form state
  const [newMsg, setNewMsg] = useState({
    profile_id: "",
    title: "",
    content: "",
    type: "service",
  });

  const [customers, setCustomers] = useState<any[]>([]);

  useEffect(() => {
    fetchMessages();
    fetchCustomers();
  }, []);

  const fetchMessages = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("messages")
        .select(`
          *,
          profiles (
            name,
            trading_name,
            email
          )
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setMessages(data || []);
    } catch (error: any) {
      toast.error("خطأ في تحميل الرسائل");
    } finally {
      setLoading(false);
    }
  };

  const fetchCustomers = async () => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, name, trading_name, email")
        .order("name");
      
      if (error) throw error;
      setCustomers(data || []);
    } catch (error) {
      console.error("Error fetching customers:", error);
    }
  };

  const handleSendMessage = async () => {
    if (!newMsg.title || !newMsg.content || (!newMsg.profile_id && newMsg.profile_id !== "all")) {
      toast.error("يرجى ملء جميع الحقول المطلوبة");
      return;
    }

    setIsSending(true);
    try {
      if (newMsg.profile_id === "all") {
        // Send to all customers
        const msgs = customers.map(c => ({
          profile_id: c.id,
          title: newMsg.title,
          content: newMsg.content,
          type: newMsg.type,
          status: 'sent',
          sent_at: new Date().toISOString()
        }));

        const { error } = await supabase.from("messages").insert(msgs);
        if (error) throw error;
      } else {
        // Send to specific customer
        const { error } = await supabase.from("messages").insert({
          profile_id: newMsg.profile_id,
          title: newMsg.title,
          content: newMsg.content,
          type: newMsg.type,
          status: 'sent',
          sent_at: new Date().toISOString()
        });
        if (error) throw error;
      }

      toast.success("تم إرسال الرسالة بنجاح");
      setNewMsg({ profile_id: "", title: "", content: "", type: "service" });
      fetchMessages();
    } catch (error: any) {
      toast.error("فشل في إرسال الرسالة");
    } finally {
      setIsSending(false);
    }
  };

  const filteredMessages = messages.filter(msg => {
    const matchesSearch = 
      msg.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      msg.profiles?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      msg.profiles?.trading_name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = typeFilter === "all" || msg.type === typeFilter;
    
    return matchesSearch && matchesType;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'sent':
        return <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-none"><CheckCircle2 className="w-3 h-3 mr-1" /> مرسلة</Badge>;
      case 'pending':
        return <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100 border-none"><Clock className="w-3 h-3 mr-1" /> قيد الانتظار</Badge>;
      case 'failed':
        return <Badge className="bg-rose-100 text-rose-700 hover:bg-rose-100 border-none"><XCircle className="w-3 h-3 mr-1" /> فشلت</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'reminder':
        return <Clock className="w-4 h-4 text-amber-500" />;
      case 'push':
        return <Bell className="w-4 h-4 text-primary" />;
      case 'service':
        return <MessageSquare className="w-4 h-4 text-blue-500" />;
      default:
        return <Mail className="w-4 h-4 text-zinc-500" />;
    }
  };

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Bell className="w-6 h-6 text-primary" />
            إدارة التواصل والتنبيهات
          </h2>
          <p className="text-zinc-500">إرسال رسائل الخدمة، التنبيهات، وإشعارات الـ Push للعملاء</p>
        </div>

        <Dialog>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Send className="w-4 h-4" />
              إرسال رسالة جديدة
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]" dir="rtl">
            <DialogHeader>
              <DialogTitle>إرسال رسالة/تنبيه</DialogTitle>
              <DialogDescription>
                يمكنك إرسال رسالة لعميل محدد أو لجميع العملاء.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">المستلم</label>
                <Select 
                  value={newMsg.profile_id} 
                  onValueChange={(v) => setNewMsg({...newMsg, profile_id: v})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="اختر العميل" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">جميع العملاء</SelectItem>
                    {customers.map(c => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.trading_name || c.name} ({c.email})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">نوع الرسالة</label>
                <Select 
                  value={newMsg.type} 
                  onValueChange={(v) => setNewMsg({...newMsg, type: v})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="service">رسالة خدمة</SelectItem>
                    <SelectItem value="reminder">تذكير (اشتراك/فاتورة)</SelectItem>
                    <SelectItem value="push">إشعار Push</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">العنوان</label>
                <Input 
                  placeholder="عنوان الرسالة" 
                  value={newMsg.title}
                  onChange={(e) => setNewMsg({...newMsg, title: e.target.value})}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">المحتوى</label>
                <Textarea 
                  placeholder="اكتب نص الرسالة هنا..." 
                  rows={4}
                  value={newMsg.content}
                  onChange={(e) => setNewMsg({...newMsg, content: e.target.value})}
                />
              </div>
            </div>
            <DialogFooter className="flex-row-reverse gap-2">
              <Button onClick={handleSendMessage} disabled={isSending}>
                {isSending ? "جاري الإرسال..." : "إرسال الآن"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 rounded-full bg-blue-100 text-blue-600">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm text-zinc-500">رسائل الخدمة</div>
              <div className="text-2xl font-bold">{messages.filter(m => m.type === 'service').length}</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 rounded-full bg-amber-100 text-amber-600">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm text-zinc-500">التذكيرات المرسلة</div>
              <div className="text-2xl font-bold">{messages.filter(m => m.type === 'reminder').length}</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 rounded-full bg-primary/10 text-primary">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm text-zinc-500">إشعارات Push</div>
              <div className="text-2xl font-bold">{messages.filter(m => m.type === 'push').length}</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
              <Input 
                placeholder="بحث في الرسائل أو العملاء..." 
                className="pr-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-[150px]">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="النوع" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">الكل</SelectItem>
                  <SelectItem value="service">رسائل الخدمة</SelectItem>
                  <SelectItem value="reminder">تذكيرات</SelectItem>
                  <SelectItem value="push">إشعارات Push</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="icon" onClick={fetchMessages}>
                <History className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Message Logs */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <History className="w-5 h-5" />
            سجل الرسائل (Messages Log)
          </CardTitle>
          <CardDescription>عرض تفصيلي لجميع الرسائل المرسلة والحالة الخاصة بها</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-zinc-50 dark:bg-zinc-900 border-y">
                <tr>
                  <th className="text-right p-4 font-bold">التاريخ</th>
                  <th className="text-right p-4 font-bold">العميل</th>
                  <th className="text-right p-4 font-bold">العنوان</th>
                  <th className="text-right p-4 font-bold">النوع</th>
                  <th className="text-right p-4 font-bold">الحالة</th>
                  <th className="text-right p-4 font-bold">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {loading ? (
                  <tr><td colSpan={6} className="p-8 text-center">جاري التحميل...</td></tr>
                ) : filteredMessages.length === 0 ? (
                  <tr><td colSpan={6} className="p-8 text-center text-zinc-500">لا توجد رسائل مطابقة</td></tr>
                ) : (
                  filteredMessages.map((msg) => (
                    <tr key={msg.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors">
                      <td className="p-4 whitespace-nowrap">
                        <div className="font-medium">{format(new Date(msg.created_at), 'dd/MM/yyyy')}</div>
                        <div className="text-xs text-zinc-500">{format(new Date(msg.created_at), 'HH:mm')}</div>
                      </td>
                      <td className="p-4">
                        <div className="font-bold">{msg.profiles?.trading_name || msg.profiles?.name}</div>
                        <div className="text-xs text-zinc-500">{msg.profiles?.email}</div>
                      </td>
                      <td className="p-4">
                        <div className="max-w-[200px] truncate font-medium">{msg.title}</div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          {getTypeIcon(msg.type)}
                          <span>
                            {msg.type === 'service' ? 'خدمة' : msg.type === 'reminder' ? 'تذكير' : 'Push'}
                          </span>
                        </div>
                      </td>
                      <td className="p-4">
                        {getStatusBadge(msg.status)}
                      </td>
                      <td className="p-4">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="ghost" size="sm">عرض</Button>
                          </DialogTrigger>
                          <DialogContent dir="rtl">
                            <DialogHeader>
                              <DialogTitle>{msg.title}</DialogTitle>
                              <DialogDescription>
                                تفاصيل الرسالة المرسلة إلى {msg.profiles?.name}
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                              <div className="p-4 bg-zinc-50 dark:bg-zinc-900 rounded-lg whitespace-pre-wrap">
                                {msg.content}
                              </div>
                              <div className="grid grid-cols-2 gap-4 text-xs">
                                <div>
                                  <span className="text-zinc-500">تاريخ الإرسال:</span>
                                  <div className="font-medium">
                                    {msg.sent_at ? format(new Date(msg.sent_at), 'dd/MM/yyyy HH:mm') : 'لم ترسل بعد'}
                                  </div>
                                </div>
                                <div>
                                  <span className="text-zinc-500">رقم الرسالة (ID):</span>
                                  <div className="font-mono">{msg.id.slice(0, 8)}...</div>
                                </div>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Automatic Reminders Settings (Mockup) */}
      <Card className="border-amber-100 bg-amber-50/30">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-600" />
            التنبيهات التلقائية النشطة
          </CardTitle>
          <CardDescription>التنبيهات التي يقوم النظام بإرسالها تلقائياً للعملاء</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-white dark:bg-zinc-900 rounded-lg border text-sm">
            <div className="flex items-center gap-3">
              <Clock className="w-4 h-4 text-amber-500" />
              <span>تذكير قرب انتهاء فترة التجربة (قبل يومين)</span>
            </div>
            <Badge variant="outline" className="text-emerald-600 border-emerald-200 bg-emerald-50">نشط</Badge>
          </div>
          <div className="flex items-center justify-between p-3 bg-white dark:bg-zinc-900 rounded-lg border text-sm">
            <div className="flex items-center gap-3">
              <Clock className="w-4 h-4 text-amber-500" />
              <span>تذكير قرب انتهاء الاشتراك (قبل 5 أيام)</span>
            </div>
            <Badge variant="outline" className="text-emerald-600 border-emerald-200 bg-emerald-50">نشط</Badge>
          </div>
          <div className="flex items-center justify-between p-3 bg-white dark:bg-zinc-900 rounded-lg border text-sm">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-4 h-4 text-rose-500" />
              <span>تنبيه فواتير متأخرة</span>
            </div>
            <Badge variant="outline" className="text-emerald-600 border-emerald-200 bg-emerald-50">نشط</Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
