import React from 'react';
import { Button } from '../components/ui/Button';
import { Check } from 'lucide-react';

const plans = [
    {
        name: "Start",
        price: "Bepul",
        period: "14 kun",
        description: "Tizim imkoniyatlarini tanishish uchun ideal.",
        features: ["1 ta Kassa", "Cheksiz ofitsiantlar", "Ombor hisobi", "Lokal tarmoq"],
        cta: "Bog'lanish",
        popular: false
    },
    {
        name: "Standard",
        price: "400,000",
        period: "oyiga",
        description: "Kichik va o'rta restoranlar uchun to'liq yechim.",
        features: ["Barcha Start imkoniyatlari", "Bulutli arxiv", "Mobil ilova", "Telegram bot (Mijozlar uchun)", "24/7 Support"],
        cta: "Bog'lanish",
        popular: true
    },
    {
        name: "Premium",
        price: "Kelishilgan",
        period: "",
        description: "Yirik tarmoqlar va franchayzalar uchun.",
        features: ["Barcha Standard imkoniyatlari", "Alohida Server (VPS)", "Brending (White Label)", "API Integratsiyasi", "Shaxsiy menejer"],
        cta: "Bog'lanish",
        popular: false
    }
];

export function Pricing({ onContactClick }) {
    return (
        <section id="pricing" className="py-24">
            <div className="container mx-auto px-6">
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">Oddiy va hamyonbop narxlar</h2>
                    <p className="text-gray-400 text-lg">
                        Yashirin to'lovlar yo'q. Istalgan vaqtda bekor qilishingiz mumkin.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {plans.map((plan, index) => (
                        <div key={index} className={`relative p-8 rounded-2xl border flex flex-col ${plan.popular ? 'bg-surface border-primary shadow-2xl shadow-primary/20 scale-105 z-10' : 'bg-background border-white/10 hover:border-white/20'}`}>
                            {plan.popular && (
                                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-primary text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">
                                    Eng ommabop
                                </div>
                            )}

                            <div className="mb-8">
                                <h3 className="text-xl font-bold text-white mb-2">{plan.name}</h3>
                                <p className="text-gray-400 text-sm mb-6">{plan.description}</p>
                                <div className="flex items-end gap-1">
                                    <span className="text-4xl font-bold text-white">{plan.price}</span>
                                    <span className="text-gray-500 mb-1">{plan.period ? `so'm / ${plan.period}` : ''}</span>
                                </div>
                            </div>

                            <ul className="space-y-4 mb-8 flex-1">
                                {plan.features.map((feature, idx) => (
                                    <li key={idx} className="flex items-center gap-3 text-gray-300 text-sm">
                                        <Check className="w-5 h-5 text-primary shrink-0" />
                                        {feature}
                                    </li>
                                ))}
                            </ul>

                            <Button variant={plan.popular ? "default" : "outline"} className="w-full" onClick={onContactClick}>
                                {plan.cta}
                            </Button>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
