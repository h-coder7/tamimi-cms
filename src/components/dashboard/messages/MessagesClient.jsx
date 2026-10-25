"use client";

import { useMemo, useState } from "react";
import PageHeader from "@/components/layout/PageHeader";
import MessagesTable from "./MessagesTable";
import MessageDetailsOffcanvas from "./MessageDetailsOffcanvas";
import MessageModal from "./MessageModal";
import { useCompanies } from "@/hooks/useCompanies";
import { buildCompaniesByCode } from "@/lib/companyOptions";
import {
  exportMessagesCsv,
  fetchMessageDetails,
  useAddMessage,
  useDeleteMessage,
  useMarkMessageUnread,
  useMessages,
} from "@/hooks/useMessages";
import { getApiErrorMessage } from "@/app/api/api";
import { toast } from "react-hot-toast";
import { confirmAction } from "@/utils/confirm";
import { useI18n } from "@/hooks/useI18n";

export default function MessagesClient() {
  const { t } = useI18n();
  const { data: messages = [], isLoading, refetch } = useMessages();
  const { data: companies = [] } = useCompanies();
  const addMutation = useAddMessage();
  const unreadMutation = useMarkMessageUnread();
  const deleteMutation = useDeleteMessage();
  const [viewMessage, setViewMessage] = useState(null);
  const [showOffcanvas, setShowOffcanvas] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [exporting, setExporting] = useState(false);

  const companiesByCode = useMemo(
    () => buildCompaniesByCode(companies, { includeGroup: true }),
    [companies]
  );

  const handleView = async (message) => {
    setShowOffcanvas(true);
    setViewMessage(message);
    try {
      const fresh = await fetchMessageDetails(message.id);
      setViewMessage(fresh);
      await refetch();
    } catch (error) {
      toast.error(getApiErrorMessage(error, t("messages.couldNotLoad")));
    }
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      await exportMessagesCsv();
    } finally {
      setExporting(false);
    }
  };

  const handleSave = async (form) => {
    await addMutation.mutateAsync(form);
    setIsModalOpen(false);
  };

  const handleMarkUnread = async (message) => {
    if (!message?.id) return;
    await unreadMutation.mutateAsync(message.id);
    if (viewMessage?.id === message.id) {
      setViewMessage({ ...viewMessage, status: "New" });
    }
  };

  const handleDelete = (message) => {
    if (!message?.id) return;
    confirmAction({
      title: t("confirm.moveTrashTitle"),
      message: t("confirm.moveTrashMessage", { item: t("messages.item") }),
      confirmLabel: t("confirm.moveTrashYes"),
      onConfirm: async () => {
        await deleteMutation.mutateAsync(message.id);
        if (viewMessage?.id === message.id) {
          setShowOffcanvas(false);
          setViewMessage(null);
        }
      },
    });
  };

  return (
    <>
      <PageHeader
        title={t("messages.pageTitle")}
        icon="fal fa-envelope"
        titleCol="col-lg-5"
        actionCol="col-lg-7"
      >
        <button
          type="button"
          className="alert alert-success rounded-pill py-2 px-3 fsz-12 ms-2 border-0 mb-0"
          onClick={() => setIsModalOpen(true)}
        >
          <i className="fal fa-plus"></i>
          <span className="txt ms-2">{t("messages.add")}</span>
        </button>
        <button
          type="button"
          className="alert alert-secondary rounded-pill py-2 px-3 fsz-12 ms-2 border-0 mb-0"
          onClick={handleExport}
          disabled={exporting || isLoading}
        >
          <i className="fal fa-file-csv"></i>
          <span className="txt ms-2">
            {exporting ? t("messages.exporting") : t("messages.exportCsv")}
          </span>
        </button>
      </PageHeader>

      {isLoading ? (
        <div className="text-center py-5 text-muted">{t("messages.loading")}</div>
      ) : (
        <MessagesTable
          data={messages}
          companiesByCode={companiesByCode}
          onView={handleView}
          onMarkUnread={handleMarkUnread}
          onDelete={handleDelete}
        />
      )}

      <MessageModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
      />

      <MessageDetailsOffcanvas
        show={showOffcanvas}
        message={viewMessage}
        company={
          viewMessage ? companiesByCode[viewMessage.company_code] : null
        }
        onClose={() => {
          setShowOffcanvas(false);
          setViewMessage(null);
        }}
        onMarkUnread={handleMarkUnread}
        onDelete={handleDelete}
      />
    </>
  );
}
