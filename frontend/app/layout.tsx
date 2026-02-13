import React from "react";
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
    title: "MAARS Enterprise | AI Research System",
    description: "Multi-Agent Autonomous Research System - Generate IEEE-format academic papers with AI",
    keywords: ["AI", "Research", "Academic", "IEEE", "Paper Generation"],
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en" className="dark">
            <head>
                <link
                    href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap"
                    rel="stylesheet"
                />
            </head>
            <body className="dark animated-gradient min-h-screen">
                {children}
            </body>
        </html>
    );
}
