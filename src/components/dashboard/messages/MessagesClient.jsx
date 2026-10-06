"use client";

import { useMemo, useState } from "react";
import PageHeader from "@/components/layout/PageHeader";
import MessagesTable, { exportMessagesCsv } from "./MessagesTable";
import MessageDetailsOffcanvas from "./MessageDetailsOffcanvas";
import { useCompanies } from "@/hooks/useCompanies";
import { useMessages } from "@/hooks/useMessages";

export default function MessagesClient() {
    const { data: messages = [], isLoading } = useMessages();
    const { data: companies = [] } = useCompanies();
    const [viewMessage, setViewMessage] = useState(null);
    const [showOffcanvas, setShowOffcanvas] = useState(false);

    const companiesByCode = useMemo(() => {
        const map = {
            TEG: { code: "TEG", title: "Tamimi Energy Group", image: "/images/logo.png" },
        };
        companies.forEach((company) => {
            if (company.code) map[company.code] = company;
        });
        return map;
    }, [companies]);

    const handleView = (message) => {
        setViewMessage(message);
        setShowOffcanvas(true);
    };

    return (
        <>
            <PageHeader
                title="Messages & inquiries"
                icon="fal fa-envelope"
                titleCol="col-lg-6"
                actionCol="col-lg-6"
            >
                <button
                    type="button"
                    className="alert alert-secondary rounded-pill py-2 px-3 fsz-12 ms-2 border-0 mb-0"
                    onClick={() => exportMessagesCsv(messages)}
                    disabled={isLoading || messages.length === 0}
                >
                    <i className="fal fa-file-csv"></i>
                    <span className="txt ms-2">Export CSV</span>
                </button>
            </PageHeader>

            {isLoading ? (
                <div className="text-center py-5 text-muted">Loading messages...</div>
            ) : (
                <MessagesTable
                    data={messages}
                    companiesByCode={companiesByCode}
                    onView={handleView}
                />
            )}

            <MessageDetailsOffcanvas
                show={showOffcanvas}
                message={viewMessage}
                company={viewMessage ? companiesByCode[viewMessage.company_code] : null}
                onClose={() => {
                    setShowOffcanvas(false);
                    setViewMessage(null);
                }}
            />
        </>
    );
}
