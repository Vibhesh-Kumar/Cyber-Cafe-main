import { useListApplications, useGetMe, useListNotifications, useMarkNotificationRead } from "@workspace/api-client-react";
import { Link } from "wouter";
import { LoadingPage } from "@/components/LoadingState";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge, PaymentStatusBadge } from "@/components/StatusBadge";
import { formatDateTime } from "@/lib/format";
import { Bell, FileText, PlusCircle, ArrowRight, CheckCircle2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function Portal() {
  const { data: user, isLoading: userLoading } = useGetMe();
  const { data: applications, isLoading: appsLoading } = useListApplications();
  const { data: notifications, isLoading: notifsLoading, refetch: refetchNotifs } = useListNotifications();
  const markRead = useMarkNotificationRead();

  const handleMarkRead = async (id: number) => {
    await markRead.mutateAsync({ id });
    refetchNotifs();
  };

  if (userLoading || appsLoading || notifsLoading) return <LoadingPage />;

  return (
    <div className="flex flex-col min-h-screen bg-muted/20">
      {/* Dashboard Header */}
      <div className="bg-secondary text-white pb-24 pt-12 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto max-w-6xl">
          <h1 className="text-3xl font-bold font-serif">Welcome back, {user?.name}</h1>
          <p className="text-secondary-foreground/70 mt-2">Manage your applications and documents securely.</p>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl -mt-16 mb-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            <Card className="shadow-lg border-0">
              <CardHeader className="flex flex-row items-center justify-between border-b bg-card pb-4">
                <CardTitle className="text-xl">My Applications</CardTitle>
                <Link href="/services">
                  <Button size="sm" className="gap-2"><PlusCircle className="h-4 w-4" /> New</Button>
                </Link>
              </CardHeader>
              <CardContent className="p-0">
                {applications?.length === 0 ? (
                  <div className="p-12 text-center">
                    <div className="h-16 w-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                      <FileText className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <h3 className="font-bold text-secondary text-lg mb-2">No applications yet</h3>
                    <p className="text-muted-foreground mb-6">Start by browsing our list of digital services.</p>
                    <Link href="/services"><Button>Browse Services</Button></Link>
                  </div>
                ) : (
                  <div className="divide-y">
                    {applications?.map(app => (
                      <div key={app.id} className="p-6 hover:bg-muted/30 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-3 mb-2">
                            <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-1 rounded">{app.applicationNumber}</span>
                            <StatusBadge status={app.status} />
                          </div>
                          <h4 className="font-bold text-secondary text-lg">{app.serviceName}</h4>
                          <p className="text-xs text-muted-foreground mt-1">Submitted on {formatDateTime(app.createdAt)}</p>
                        </div>
                        <div className="flex flex-col items-start sm:items-end gap-3">
                          <PaymentStatusBadge status={app.paymentStatus} />
                          <Link href={`/portal/applications/${app.id}`}>
                            <Button variant="outline" size="sm">View Details <ArrowRight className="ml-2 h-3 w-3" /></Button>
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            <Card className="shadow-lg border-0 overflow-hidden">
              <div className="bg-primary p-6 text-white">
                <div className="h-16 w-16 bg-white/20 rounded-full flex items-center justify-center mb-4 text-2xl font-bold">
                  {user?.name.charAt(0)}
                </div>
                <h3 className="font-bold text-xl">{user?.name}</h3>
                <p className="text-white/80 text-sm">{user?.email}</p>
                {user?.phone && <p className="text-white/80 text-sm mt-1">{user?.phone}</p>}
              </div>
            </Card>

            <Card className="shadow-lg border-0">
              <CardHeader className="border-b bg-card pb-4">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Bell className="h-5 w-5 text-primary" /> Notifications
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0 max-h-[400px] overflow-auto">
                {notifications?.length === 0 ? (
                  <div className="p-8 text-center text-muted-foreground text-sm">
                    No new notifications
                  </div>
                ) : (
                  <div className="divide-y">
                    {notifications?.map(notif => (
                      <div key={notif.id} className={`p-4 ${notif.isRead ? 'bg-card' : 'bg-primary/5'}`}>
                        <div className="flex justify-between items-start gap-4">
                          <div>
                            <h5 className={`text-sm ${notif.isRead ? 'font-medium text-secondary' : 'font-bold text-primary'}`}>{notif.title}</h5>
                            <p className="text-xs text-muted-foreground mt-1">{notif.message}</p>
                            <p className="text-[10px] text-muted-foreground/60 mt-2">{formatDateTime(notif.createdAt)}</p>
                          </div>
                          {!notif.isRead && (
                            <Button variant="ghost" size="icon" className="h-6 w-6 text-primary hover:bg-primary/10 shrink-0" onClick={() => handleMarkRead(notif.id)} title="Mark as read">
                              <CheckCircle2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
