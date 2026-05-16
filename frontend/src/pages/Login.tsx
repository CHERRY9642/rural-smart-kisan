import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useLanguage } from '@/contexts/LanguageContext';
import { Eye, EyeOff, Leaf } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { authService } from '@/services/authService';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginForm = z.infer<typeof loginSchema>;

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const { translateSync } = useLanguage();
  const navigate = useNavigate();
  const { toast } = useToast();

  const form = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginForm) => {
    try {
      await authService.login(data.email, data.password);
      toast({
        title: translateSync("Login Successful"),
        description: translateSync("Welcome back to AgriTech!"),
      });
      navigate('/dashboard');
    } catch (error) {
      toast({
        title: translateSync("Login Failed"),
        description: translateSync(error instanceof Error ? error.message : "Invalid email or password"),
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-farm-primary/5 via-background to-farm-accent/5 flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-grid-pattern opacity-5" />
      
      {/* Enhanced floating animations */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-10 w-8 h-8 text-farm-leaf opacity-30 animate-float-leaf-1 animate-pulse">🌿</div>
        <div className="absolute top-32 right-20 w-6 h-6 text-farm-accent opacity-40 animate-float-leaf-2 animate-bounce">🌾</div>
        <div className="absolute bottom-32 left-1/4 w-7 h-7 text-farm-leaf opacity-25 animate-float-leaf-3">🍃</div>
        <div className="absolute bottom-20 right-1/3 w-5 h-5 text-farm-accent opacity-35 animate-float-leaf-4 animate-pulse">🌿</div>
        <div className="absolute top-1/2 left-20 w-6 h-6 text-farm-leaf opacity-20 animate-float-leaf-5">🌾</div>
        <div className="absolute top-1/3 right-10 w-8 h-8 text-farm-accent opacity-30 animate-float-leaf-1">🍃</div>
        
        {/* Additional animated elements */}
        <div className="absolute top-1/4 left-1/3 w-4 h-4 text-farm-sun opacity-60 animate-spin-slow">☀️</div>
        <div className="absolute bottom-1/4 right-1/4 w-5 h-5 text-farm-leaf opacity-45 animate-wiggle">🌱</div>
        <div className="absolute top-3/4 left-16 w-6 h-6 text-farm-accent opacity-35 animate-float">🌾</div>
        <div className="absolute top-16 left-1/2 w-3 h-3 text-farm-leaf opacity-50 animate-bounce">🌿</div>
      </div>
      
      <Card className="w-full max-w-md shadow-2xl border-0 bg-card/80 backdrop-blur-sm animate-fade-in hover:shadow-3xl transition-all duration-300">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-farm-primary to-farm-accent rounded-full flex items-center justify-center animate-pulse shadow-lg">
            <Leaf className="w-8 h-8 text-white animate-wiggle" />
          </div>
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-farm-primary via-farm-accent to-farm-primary bg-clip-text text-transparent animate-gradient-text">
            {translateSync("Welcome Back")}
          </CardTitle>
          <CardDescription className="text-muted-foreground animate-fade-in-up">
            {translateSync("Sign in to your AgriTech account")}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{translateSync("Email")}</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder={translateSync("Enter your email")}
                        type="email"
                        className="h-12"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{translateSync("Password")}</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input 
                          placeholder={translateSync("Enter your password")}
                          type={showPassword ? "text" : "password"}
                          className="h-12 pr-12"
                          {...field} 
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button 
                type="submit" 
                className="w-full h-12 bg-gradient-to-r from-farm-primary to-farm-accent hover:from-farm-primary/90 hover:to-farm-accent/90 transition-all duration-300"
                disabled={form.formState.isSubmitting}
              >
                {form.formState.isSubmitting ? translateSync("Signing in...") : translateSync("Sign In")}
              </Button>
            </form>
          </Form>

          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              {translateSync("Don't have an account?")}{" "}
              <Link 
                to="/signup" 
                className="font-medium text-farm-primary hover:text-farm-accent transition-colors"
              >
                {translateSync("Sign up")}
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;
