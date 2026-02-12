import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Star, Download, ExternalLink, Calendar, FileText } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Link } from 'react-router-dom';

const Tools = () => {
    const products = [
        {
            id: 1,
            title: "Smart Roster",
            tag: "ESSENTIAL",
            desc: "The core rostering solution for nurses. Cloud-synced, easy-to-use, and accessible anywhere. Manage your shifts effortlessly.",
            price: "Free",
            icon: <Calendar className="w-full h-full text-primary" />,
            link: "/roster",
            action: "Open Roster",
            highlight: true
        },
        {
            id: 2,
            title: "Theater Statistics",
            tag: "ANALYTICS",
            desc: "Comprehensive theater operation statistics and analytics. Track, manage, and analyze theater data efficiently. Available online and offline.",
            price: "Free",
            icon: <FileText className="w-full h-full text-teal-500" />,
            link: "/theater",
            action: "Open Theater",
            highlight: false
        },

    ];

    return (
        <div className="text-foreground min-h-screen py-24 bg-background">
            <div className="container px-4 mx-auto">
                <div className="text-center max-w-3xl mx-auto mb-20">
                    <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-6 text-foreground">
                        Professional <span className="text-primary">Tools</span>
                    </h1>
                    <p className="text-xl text-muted-foreground">
                        Dedicated software designed to accelerate your workflow and simplify administration.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
                    {products.map((product, index) => (
                        <ProductCard key={product.id} product={product} index={index} />
                    ))}
                </div>
            </div>
        </div>
    );
};

const ProductCard = ({ product, index }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.1 }}
        className={`relative group p-1 rounded-2xl w-full max-w-md ${product.highlight ? 'bg-gradient-to-br from-primary to-teal-400' : 'bg-card border border-border'}`}
    >
        <div className="bg-card h-full rounded-xl p-8 flex flex-col relative overflow-hidden">
            <div className="absolute top-4 right-4 p-2 opacity-20 w-24 h-24 group-hover:scale-110 transition-transform duration-500">
                {product.icon}
            </div>

            <span className={`text-xs font-bold tracking-widest px-3 py-1 rounded-full w-fit mb-4 ${product.highlight ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'}`}>
                {product.tag}
            </span>

            <h3 className="text-2xl font-bold mb-2 text-foreground">{product.title}</h3>
            <p className="text-muted-foreground mb-8 flex-1 leading-relaxed">{product.desc}</p>

            <div className="flex items-center justify-between mt-auto pt-8 border-t border-border">
                <span className="text-xl font-bold text-foreground">{product.price}</span>
                {product.link.startsWith('http') || product.link === '#' ? (
                    <Button className={`${product.highlight ? 'bg-primary hover:bg-primary/90 text-primary-foreground' : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'} rounded-full`}>
                        {product.action}
                    </Button>
                ) : (
                    <Link to={product.link}>
                        <Button className={`${product.highlight ? 'bg-primary hover:bg-primary/90 text-primary-foreground' : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'} rounded-full`}>
                            {product.action} <ArrowRight className="ml-2 w-4 h-4" />
                        </Button>
                    </Link>
                )}
            </div>
        </div>
    </motion.div>
);

export default Tools;
