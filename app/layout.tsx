import React from "react"
import "./globals.css";

type Props = {
    children: React.ReactNode
}

export const metadata = {
    title: "Scorekeeper",
    description: "Disc Golf scorekeeping application"
}

export default function RootLayout({ children }: Props) {
    return <html lang="en">
        <body>{children}</body>
    </html>
}