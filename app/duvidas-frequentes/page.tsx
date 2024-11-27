"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { useState } from "react";
import { Plus, Minus } from "lucide-react";

interface FAQ {
    pergunta: string;
    resposta: string;
}

const faqs: FAQ[] = [
    {
        pergunta: "Como funciona o processo de orçamento?",
        resposta: "Após selecionar os produtos desejados e preencher o formulário de orçamento, nossa equipe analisará seu pedido e entrará em contato por email em até 24 horas úteis com um orçamento personalizado. O valor final considerará a quantidade de itens, período de locação e localização do evento."
    },
    {
        pergunta: "Quanto tempo leva para receber o orçamento?",
        resposta: "Nosso compromisso é responder todos os pedidos de orçamento em até 24 horas úteis. Você receberá um email detalhado com os valores, condições de pagamento e todas as informações necessárias para prosseguir com a locação."
    },
    {
        pergunta: "É possível personalizar os produtos?",
        resposta: "Sim! Caso você não encontre exatamente o que procura em nosso catálogo, podemos avaliar a possibilidade de personalização ou fabricação sob medida. Entre em contato conosco detalhando suas necessidades específicas."
    },
    {
        pergunta: "Qual é a antecedência necessária para fazer a reserva?",
        resposta: "Recomendamos fazer a reserva com pelo menos 30 dias de antecedência para garantir a disponibilidade dos produtos desejados. Para eventos em alta temporada (como dezembro), sugerimos um prazo ainda maior."
    },
    {
        pergunta: "Como é feita a entrega e retirada dos produtos?",
        resposta: "Realizamos a entrega e retirada dos produtos diretamente no local do evento. O valor do frete será calculado com base na localização e incluído no orçamento final. Nossa equipe garante pontualidade e cuidado no manuseio de todos os itens."
    },
    {
        pergunta: "Existe um pedido mínimo para locação?",
        resposta: "Não temos quantidade mínima estabelecida, porém o valor do frete pode tornar pedidos muito pequenos proporcionalmente mais caros. Recomendamos consultar nosso time para encontrar a melhor solução para seu evento."
    }
];

export default function FAQPage() {
    const [ref, inView] = useInView({
        triggerOnce: true,
        threshold: 0.1,
    });

    const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

    const toggleFAQ = (index: number) => {
        setExpandedIndex(expandedIndex === index ? null : index);
    };

    return (
        <div className="min-h-screen py-20 px-4 md:px-8">
            <motion.div
                ref={ref}
                initial={{ opacity: 0, y: 20 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6 }}
                className="max-w-4xl mx-auto"
            >
                <h1 className="text-4xl md:text-5xl font-bold text-center mb-4">
                    Dúvidas Frequentes
                </h1>
                <p className="text-neutral-600 dark:text-neutral-300 text-center mb-12 text-lg">
                    Encontre respostas para as principais dúvidas sobre nossos serviços
                </p>

                <div className="space-y-4">
                    {faqs.map((faq, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="border dark:border-neutral-800 rounded-lg overflow-hidden"
                        >
                            <button
                                onClick={() => toggleFAQ(index)}
                                className="w-full p-6 text-left flex justify-between items-center hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors"
                            >
                                <span className="font-medium text-lg">{faq.pergunta}</span>
                                {expandedIndex === index ? (
                                    <Minus className="h-5 w-5 text-primary" />
                                ) : (
                                    <Plus className="h-5 w-5 text-primary" />
                                )}
                            </button>

                            <AnimatePresence>
                                {expandedIndex === index && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: "auto", opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{ duration: 0.3 }}
                                        className="overflow-hidden"
                                    >
                                        <div className="p-6 pt-0 text-neutral-600 dark:text-neutral-300">
                                            {faq.resposta}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    ))}
                </div>


                {/* CTA Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={inView ? { opacity: 1, y: 0 } : {}}
                    transition={{ delay: 0.6 }}
                    className="mt-16 text-center"
                >
                    <p className="text-lg mb-6">
                        Não encontrou o que procurava? Entre em contato conosco!
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <a
                            href="/contato"
                            className="inline-flex items-center justify-center px-6 py-3 rounded-lg bg-primary text-white hover:bg-primary/90 transition-colors dark:bg-primary/10 dark:hover:bg-primary/20 dark:text-primary"
                        >
                            Fale Conosco
                        </a>
                        <a
                            href="https://wa.me/5511940224459"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center justify-center px-6 py-3 rounded-lg bg-green-500 text-white hover:bg-green-600 transition-colors"
                        >
                            WhatsApp
                        </a>
                    </div>
                </motion.div>

            </motion.div>
        </div>
    );
}