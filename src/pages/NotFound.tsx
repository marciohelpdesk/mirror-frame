import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { motion } from "framer-motion";
import { Home, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <>
      <div className="bg-florida-sky-fixed" />
      <div className="min-h-screen relative z-10 flex items-center justify-center p-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="glass-panel p-8 max-w-md w-full text-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.1 }}
            className="text-8xl font-bold text-primary/20 mb-4"
          >
            404
          </motion.div>
          
          <h1 className="text-2xl font-bold text-foreground mb-2">
            Página não encontrada
          </h1>
          <p className="text-muted-foreground mb-6">
            A página que você procura não existe ou foi movida.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button 
              variant="outline" 
              onClick={() => window.history.back()}
              className="gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Voltar
            </Button>
            <Button asChild className="gap-2">
              <Link to="/dashboard">
                <Home className="w-4 h-4" />
                Ir para Dashboard
              </Link>
            </Button>
          </div>
        </motion.div>
      </div>
    </>
  );
};

export default NotFound;
