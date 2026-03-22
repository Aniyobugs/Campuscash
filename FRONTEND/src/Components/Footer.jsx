import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
    return (
        <footer className="bg-background border-t border-border mt-auto w-full transition-colors duration-300">
            <div className="container mx-auto px-6 py-12 lg:max-w-7xl">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-12 lg:gap-8">
                    {/* Brand Section */}
                    <div className="flex flex-col items-start">
                        <h2 className="text-2xl font-black text-primary mb-4 tracking-tight">
                            Campus Cash
                        </h2>
                        <p className="text-muted-foreground leading-relaxed max-w-sm">
                            Where every achievement pays off. Motivate. Reward. Succeed. Join the ultimate student ecosystem today.
                        </p>
                    </div>

                    {/* Navigation */}
                    <div className="flex flex-col items-start md:items-center">
                        <div className="flex flex-col gap-4">
                            <h3 className="font-bold text-lg text-foreground mb-2">Explore</h3>
                            <Link 
                                to="/" 
                                className="text-muted-foreground hover:text-primary transition-colors font-medium"
                            >
                                Home
                            </Link>
                            <Link 
                                to="/about" 
                                className="text-muted-foreground hover:text-primary transition-colors font-medium"
                            >
                                About Us
                            </Link>
                            <Link 
                                to="/contact" 
                                className="text-muted-foreground hover:text-primary transition-colors font-medium"
                            >
                                Contact Us
                            </Link>
                        </div>
                    </div>

                    {/* Contact Info */}
                    <div className="flex flex-col items-start md:items-end">
                        <div className="flex flex-col gap-4 text-left md:text-right">
                            <h3 className="font-bold text-lg text-foreground mb-2">Contact</h3>
                            <a 
                                href="mailto:info@campuscash.edu"
                                className="text-muted-foreground hover:text-primary transition-colors font-medium"
                            >
                                info@campuscash.edu
                            </a>
                            <a 
                                href="https://twitter.com/campuscash_app"
                                target="_blank"
                                rel="noreferrer"
                                className="text-muted-foreground hover:text-primary transition-colors font-medium"
                            >
                                @campuscash_app
                            </a>
                        </div>
                    </div>
                </div>

                <div className="mt-12 pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-sm font-medium text-muted-foreground">
                        © {new Date().getFullYear()} Campus Cash. All rights reserved.
                    </p>
                    <div className="flex items-center gap-6">
                        <Link to="/privacy" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                            Privacy Policy
                        </Link>
                        <Link to="/terms" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                            Terms of Service
                        </Link>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
