import React from 'react';
import { motion } from 'framer-motion';
import { Code, Palette, Server, Heart } from 'lucide-react';

const About = () => {
    return (
        <div className="text-foreground min-h-screen bg-background">
            <div className="container px-4 py-24 mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="max-w-4xl mx-auto text-center"
                >
                    <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-8 text-foreground">
                        Supporting Our <span className="text-primary">Healthcare Heroes</span>
                    </h1>
                    <p className="text-xl text-muted-foreground mb-12 leading-relaxed">
                        Sri Lankan Nurses Hub is a dedicated platform designed to streamline the daily administrative tasks of nursing professionals. From complex roster management to automated Form 108 generation, we aim to save you time so you can focus on what matters most — patient care.
                    </p>
                </motion.div>

                <div className="max-w-4xl mx-auto mt-20 border-t border-border pt-16">
                    <motion.div
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        transition={{ duration: 1 }}
                        className="text-center"
                    >
                        <p className="text-sm font-semibold text-muted-foreground uppercase tracking-widest mb-4">Developed By</p>
                        <div className="inline-flex items-center gap-2 mb-6 group">
                            <span className="font-black text-3xl uppercase tracking-tighter text-foreground">Design</span>
                            <div className="w-[4px] h-8 bg-destructive mx-[1px] -rotate-12"></div>
                            <span className="font-black text-3xl uppercase tracking-tighter text-foreground">Ink.</span>
                        </div>
                        <p className="text-muted-foreground max-w-lg mx-auto mb-8">
                            A creative technology studio passionate about building digital tools that empower professionals. Blending robust engineering with intuitive design.
                        </p>
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default About;
