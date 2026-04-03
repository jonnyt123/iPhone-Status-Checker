import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { useAdminLogin } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";
import { Shield, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  const login = useAdminLogin();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login.mutate(
      { data: { email, password } },
      {
        onSuccess: (data) => {
          if (data.authenticated) {
            setLocation("/admin/dashboard");
          } else {
            toast({ title: "Login failed", description: "Invalid credentials", variant: "destructive" });
          }
        },
        onError: () => {
          toast({ title: "Error", description: "Could not connect to server", variant: "destructive" });
        }
      }
    );
  };

  return (
    <div className="min-h-[100dvh] flex items-center justify-center bg-muted/30 p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm"
      >
        <Card className="rounded-[2rem] shadow-xl border-0 bg-card overflow-hidden">
          <CardContent className="p-8 sm:p-10 space-y-8">
            <div className="text-center space-y-4">
              <div className="mx-auto bg-primary/10 p-4 rounded-2xl w-fit shadow-inner">
                <Shield className="w-8 h-8 text-primary" />
              </div>
              <h1 className="text-2xl font-bold tracking-tight" data-testid="text-admin-login-title">Admin Access</h1>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-muted-foreground ml-1">Email</Label>
                <Input 
                  id="email" 
                  type="email" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  required 
                  className="h-12 rounded-xl bg-background border-border"
                  placeholder="admin@example.com"
                  data-testid="input-admin-email"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-muted-foreground ml-1">Password</Label>
                <Input 
                  id="password" 
                  type="password" 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  required 
                  className="h-12 rounded-xl bg-background border-border"
                  placeholder="••••••••"
                  data-testid="input-admin-password"
                />
              </div>
              <Button 
                type="submit" 
                className="w-full h-12 rounded-xl text-base font-semibold shadow-md hover:shadow-lg transition-all" 
                disabled={login.isPending}
                data-testid="button-admin-login"
              >
                {login.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : "Sign In"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
