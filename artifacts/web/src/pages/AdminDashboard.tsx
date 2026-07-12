import { useState } from "react";
import { 
  useGetAdminStats, useListServices, useListCategories, 
  useListUsers, useUpdateUserRole, useListBlogs, 
  useListFaqs, useListTickets, useUpdateTicket,
  useDeleteService, useDeleteBlog, useDeleteFaq
} from "@workspace/api-client-react";
import { LoadingPage } from "@/components/LoadingState";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency, formatDateTime } from "@/lib/format";
import { Users, FileText, CheckCircle2, Clock, IndianRupee, Layers, FileQuestion, Mail, Settings } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StatusBadge } from "@/components/StatusBadge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { UserRole, TicketStatus } from "@workspace/api-client-react";

export default function AdminDashboard() {
  const { data: stats, isLoading: statsLoading } = useGetAdminStats();
  const { data: users, refetch: refetchUsers } = useListUsers();
  const { data: services } = useListServices();
  const { data: blogs } = useListBlogs();
  const { data: faqs } = useListFaqs();
  const { data: tickets, refetch: refetchTickets } = useListTickets();
  
  const updateUserRole = useUpdateUserRole();
  const updateTicket = useUpdateTicket();
  const { toast } = useToast();

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      await updateUserRole.mutateAsync({
        id: userId,
        data: { role: newRole as UserRole }
      });
      toast({ title: "User role updated successfully" });
      refetchUsers();
    } catch (error: any) {
      toast({ title: "Failed to update user", description: error.message, variant: "destructive" });
    }
  };

  const handleTicketStatus = async (ticketId: number, newStatus: string) => {
    try {
      await updateTicket.mutateAsync({
        id: ticketId,
        data: { status: newStatus as TicketStatus }
      });
      toast({ title: "Ticket updated" });
      refetchTickets();
    } catch (error: any) {
      toast({ title: "Failed to update ticket", description: error.message, variant: "destructive" });
    }
  };

  if (statsLoading) return <LoadingPage />;
  if (!stats) return <div className="text-center p-12">Failed to load stats.</div>;

  return (
    <div className="flex flex-col min-h-screen bg-muted/20">
      <PageHeader title="Admin Control Center" description="Overview of portal activity and manage platform resources." />

      <div className="container mx-auto px-4 py-8 flex-1">
        
        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <Card className="border-0 shadow-sm border-l-4 border-l-primary">
            <CardContent className="p-6 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-1">Total Revenue</p>
                <h3 className="text-3xl font-bold text-secondary">{formatCurrency(stats.totalRevenue)}</h3>
              </div>
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <IndianRupee className="h-6 w-6" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-0 shadow-sm border-l-4 border-l-blue-500">
            <CardContent className="p-6 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-1">Total Apps</p>
                <h3 className="text-3xl font-bold text-secondary">{stats.totalApplications}</h3>
              </div>
              <div className="h-12 w-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-500">
                <FileText className="h-6 w-6" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm border-l-4 border-l-yellow-500">
            <CardContent className="p-6 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-1">Pending Review</p>
                <h3 className="text-3xl font-bold text-secondary">{stats.pendingApplications}</h3>
              </div>
              <div className="h-12 w-12 rounded-full bg-yellow-50 flex items-center justify-center text-yellow-600">
                <Clock className="h-6 w-6" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm border-l-4 border-l-green-500">
            <CardContent className="p-6 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-1">Completed</p>
                <h3 className="text-3xl font-bold text-secondary">{stats.completedApplications}</h3>
              </div>
              <div className="h-12 w-12 rounded-full bg-green-50 flex items-center justify-center text-green-600">
                <CheckCircle2 className="h-6 w-6" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="bg-card border w-full flex-wrap h-auto justify-start p-2 gap-2">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="users">Users & Roles</TabsTrigger>
            <TabsTrigger value="services">Services</TabsTrigger>
            <TabsTrigger value="tickets">Support Tickets</TabsTrigger>
            <TabsTrigger value="content">Blog & FAQ</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <Card className="shadow-sm border-0 h-full">
                  <CardHeader className="border-b bg-card">
                    <CardTitle>Recent Applications</CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>App No.</TableHead>
                          <TableHead>Service</TableHead>
                          <TableHead>Applicant</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {stats.recentApplications.map(app => (
                          <TableRow key={app.id}>
                            <TableCell className="font-mono text-xs text-primary font-bold">{app.applicationNumber}</TableCell>
                            <TableCell className="font-medium max-w-[200px] truncate" title={app.serviceName}>{app.serviceName}</TableCell>
                            <TableCell>{app.applicantName}</TableCell>
                            <TableCell><StatusBadge status={app.status} /></TableCell>
                          </TableRow>
                        ))}
                        {stats.recentApplications.length === 0 && (
                          <TableRow>
                            <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">No recent applications.</TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-6">
                <Card className="shadow-sm border-0">
                  <CardHeader className="border-b bg-card">
                    <CardTitle>System Stats</CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="space-y-6">
                      <div className="flex items-center justify-between border-b border-dashed pb-4">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-500">
                            <Users className="h-5 w-5" />
                          </div>
                          <span className="font-bold text-secondary">Registered Users</span>
                        </div>
                        <span className="text-xl font-bold">{stats.totalUsers}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-500">
                            <Layers className="h-5 w-5" />
                          </div>
                          <span className="font-bold text-secondary">Active Services</span>
                        </div>
                        <span className="text-xl font-bold">{stats.totalServices}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="users">
            <Card className="shadow-sm border-0">
              <CardHeader className="border-b bg-card">
                <CardTitle>User Management</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Joined</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead className="w-48 text-right">Change Role</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users?.map(user => (
                      <TableRow key={user.id}>
                        <TableCell className="font-bold">{user.name}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell className="text-xs text-muted-foreground">{formatDateTime(user.createdAt)}</TableCell>
                        <TableCell>
                          <Badge variant={user.role === 'admin' ? 'destructive' : user.role === 'operator' ? 'secondary' : 'outline'}>
                            {user.role}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Select 
                            value={user.role} 
                            onValueChange={(val) => handleRoleChange(user.id, val)}
                            disabled={updateUserRole.isPending}
                          >
                            <SelectTrigger className="w-full h-8 text-xs">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="customer">Customer</SelectItem>
                              <SelectItem value="operator">Operator</SelectItem>
                              <SelectItem value="admin">Admin</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="services">
            <Card className="shadow-sm border-0">
              <CardHeader className="border-b bg-card flex flex-row items-center justify-between">
                <CardTitle>Services</CardTitle>
                <Button size="sm" variant="outline" className="gap-2"><Settings className="h-4 w-4" /> Manage</Button>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Service Name</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Fee</TableHead>
                      <TableHead>Est. Days</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {services?.map(service => (
                      <TableRow key={service.id}>
                        <TableCell className="font-bold">{service.name}</TableCell>
                        <TableCell>{service.categoryName}</TableCell>
                        <TableCell>₹{service.price}</TableCell>
                        <TableCell>{service.estimatedDays} days</TableCell>
                        <TableCell>
                          <Badge variant={service.isActive ? 'success' : 'outline'}>
                            {service.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tickets">
            <Card className="shadow-sm border-0">
              <CardHeader className="border-b bg-card">
                <CardTitle>Support Tickets</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Subject</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Created At</TableHead>
                      <TableHead className="w-48 text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {tickets?.map(ticket => (
                      <TableRow key={ticket.id}>
                        <TableCell>#{ticket.id}</TableCell>
                        <TableCell className="font-medium max-w-[200px] truncate" title={ticket.subject}>{ticket.subject}</TableCell>
                        <TableCell>
                          <Badge variant={ticket.status === 'resolved' ? 'success' : ticket.status === 'in_progress' ? 'warning' : 'outline'}>
                            {ticket.status.replace("_", " ")}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">{formatDateTime(ticket.createdAt)}</TableCell>
                        <TableCell className="text-right">
                          <Select 
                            value={ticket.status} 
                            onValueChange={(val) => handleTicketStatus(ticket.id, val)}
                          >
                            <SelectTrigger className="w-full h-8 text-xs">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="open">Open</SelectItem>
                              <SelectItem value="in_progress">In Progress</SelectItem>
                              <SelectItem value="resolved">Resolved</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                      </TableRow>
                    ))}
                    {tickets?.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">No tickets found.</TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="content">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="shadow-sm border-0">
                <CardHeader className="border-b bg-card">
                  <CardTitle className="flex items-center gap-2"><FileText className="h-5 w-5 text-primary" /> Blog Posts</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Title</TableHead>
                        <TableHead>Author</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {blogs?.map(blog => (
                        <TableRow key={blog.id}>
                          <TableCell className="font-medium line-clamp-1 border-0" title={blog.title}>{blog.title}</TableCell>
                          <TableCell className="text-xs text-muted-foreground border-0">{blog.authorName}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>

              <Card className="shadow-sm border-0">
                <CardHeader className="border-b bg-card">
                  <CardTitle className="flex items-center gap-2"><FileQuestion className="h-5 w-5 text-primary" /> FAQs</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Question</TableHead>
                        <TableHead>Category</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {faqs?.map(faq => (
                        <TableRow key={faq.id}>
                          <TableCell className="font-medium max-w-[200px] truncate border-0" title={faq.question}>{faq.question}</TableCell>
                          <TableCell className="text-xs text-muted-foreground border-0">{faq.category}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
