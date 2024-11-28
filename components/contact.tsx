"use client";

import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Phone, Mail, MapPin } from "lucide-react";
import { useState } from "react";
import { enviarEmail } from "@/lib/email-utils";
import { toast } from "react-hot-toast";
import { FaWhatsapp } from "react-icons/fa";

export function Contact() {
  // Ref para o título
  const [titleRef, titleInView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  // Refs para os itens de contato
  const [phoneRef, phoneInView] = useInView({
    triggerOnce: true,
    threshold: 0.3,
  });

  const [emailRef, emailInView] = useInView({
    triggerOnce: true,
    threshold: 0.3,
  });

  const [whatsappRef, whatsappInView] = useInView({
    triggerOnce: true,
    threshold: 0.3,
  });

  // Ref para o formulário
  const [formRef, formInView] = useInView({
    triggerOnce: true,
    threshold: 0.3,
  });

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.subject || !formData.message) {
      toast.error("Por favor, preencha todos os campos");
      return;
    }

    const loadingToast = toast.loading('Enviando mensagem...');
    setIsSubmitting(true);

    try {
      const htmlContent = `
        <h2>Nova Mensagem de Contato</h2>
        <p><strong>Nome:</strong> ${formData.name}</p>
        <p><strong>Email:</strong> ${formData.email}</p>
        <p><strong>Assunto:</strong> ${formData.subject}</p>
        <p><strong>Mensagem:</strong></p>
        <p>${formData.message.replace(/\n/g, '<br>')}</p>
      `;

      await enviarEmail({
        para: "bruno.saantunes1@gmail.com",
        assunto: `Contato via Site: ${formData.subject}`,
        html: htmlContent,
      });

      toast.success('Mensagem enviada com sucesso!', { id: loadingToast });
      
      // Limpar formulário
      setFormData({
        name: "",
        email: "",
        subject: "",
        message: "",
      });

    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      toast.error('Erro ao enviar mensagem. Tente novamente.', { id: loadingToast });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <section id="contact" className="py-20 px-4 md:px-8">
      <div className="max-w-7xl mx-auto">
        <motion.div
          ref={titleRef}
          initial={{ opacity: 0, y: 20 }}
          animate={titleInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Entre em Contato
          </h2>
          <p className="text-xl text-neutral-600 dark:text-neutral-300 max-w-3xl mx-auto">
            Estamos prontos para atender suas necessidades e criar momentos especiais juntos.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="space-y-8">
            <motion.div
              ref={phoneRef}
              initial={{ opacity: 0, x: -50 }}
              animate={phoneInView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.6 }}
              className="flex items-start space-x-4"
            >
              <Phone className="w-6 h-6 mt-1 text-primary" />
              <div>
                <h3 className="font-bold mb-1">Telefone</h3>
                <p className="text-neutral-600 dark:text-neutral-300">
                  +55 (11) 94252-1204
                </p>
              </div>
            </motion.div>

            <motion.div
              ref={emailRef}
              initial={{ opacity: 0, x: 50 }}
              animate={emailInView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.6 }}
              className="flex items-start space-x-4"
            >
              <Mail className="w-6 h-6 mt-1 text-primary" />
              <div>
                <h3 className="font-bold mb-1">E-mail</h3>
                <p className="text-neutral-600 dark:text-neutral-300">
                  j.antunes@gmail.com
                </p>
              </div>
            </motion.div>

            <motion.div
              ref={whatsappRef}
              initial={{ opacity: 0, x: -50 }}
              animate={whatsappInView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.6 }}
              className="flex items-start space-x-4"
            >
              <FaWhatsapp className="w-6 h-6 mt-1 text-primary" />
              <div>
                <h3 className="font-bold mb-1">WhatsApp</h3>
                <p className="text-neutral-600 dark:text-neutral-300">
                  Entre em contato conosco pelo WhatsApp para um atendimento mais rápido.
                </p>
                <Button
                  onClick={() => window.open(`https://wa.me/5511940224459?text=Olá! Gostaria de mais informações.`, "_blank")}
                  className="mt-2 bg-green-500 text-white"
                >
                  Fale Conosco
                </Button>
              </div>
            </motion.div>
          </div>

          <motion.form
            ref={formRef}
            onSubmit={handleSubmit}
            initial={{ opacity: 0, x: 50 }}
            animate={formInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="space-y-6"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium mb-2">
                  Nome
                </label>
                <Input 
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Seu nome" 
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium mb-2">
                  E-mail
                </label>
                <Input 
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="seu@email.com" 
                />
              </div>
            </div>

            <div>
              <label htmlFor="subject" className="block text-sm font-medium mb-2">
                Assunto
              </label>
              <Input 
                id="subject"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                placeholder="Assunto da mensagem" 
              />
            </div>

            <div>
              <label htmlFor="message" className="block text-sm font-medium mb-2">
                Mensagem
              </label>
              <Textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                placeholder="Sua mensagem"
                rows={6}
                className="resize-none"
              />
            </div>

            <Button 
              type="submit" 
              size="lg" 
              className="w-full"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Enviando...' : 'Enviar mensagem'}
            </Button>
          </motion.form>
        </div>
      </div>
    </section>
  );
}