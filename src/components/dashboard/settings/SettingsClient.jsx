"use client";

import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import PageHeader from "@/components/layout/PageHeader";
import FileUpload from "@/components/shared/FileUpload";

import { useSettings, useUpdateSettings } from "@/hooks/useSettings";

export default function SettingsClient() {
    const { data: settings, isLoading } = useSettings();
    const updateSettingsMutation = useUpdateSettings();

    const [formData, setFormData] = useState(null);
    const [activeTab, setActiveTab] = useState("website");

    // Initialize form data when settings are loaded
    useEffect(() => {
        if (settings && !formData) {
            setFormData(settings);
        }
    }, [settings, formData]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleVideoChange = (moduleName, files) => {
        setFormData((prev) => ({
            ...prev,
            videoFiles: {
                ...prev.videoFiles,
                [moduleName]: files
            }
        }));
    };

    const modules = [
        "Statistics", "Companies", "Settings"
    ];

    const tabs = [
        { id: "website", label: "Website Configuration", icon: "fal fa-globe" },
        { id: "mail", label: "Mail Configuration (SMTP)", icon: "fal fa-envelope" },
        { id: "videos", label: "Intro Videos Configuration", icon: "fal fa-video" },
    ];

    const handleSubmit = async (e) => {
        e.preventDefault();
        await updateSettingsMutation.mutateAsync(formData);
    };

    if (isLoading || !formData) {
        return (
            <div className="text-center py-5 mt-5">
                <div className="spinner-border" role="status"></div>
                <p className="mt-3 text-muted">Loading settings...</p>
            </div>
        );
    }

    return (
        <>
            <PageHeader title="Settings" icon="fal fa-gear" />

            <div className="row mt-4">
                <div className="col-lg-12">
                    {/* --- Bootstrap Tabs Navigation --- */}
                    <ul className="nav nav-pills settings-nav-pills mb-4" id="settingsTabs" role="tablist">
                        {tabs.map((tab) => (
                            <li className="nav-item" role="presentation" key={tab.id}>
                                <button
                                    className={`nav-link ${activeTab === tab.id ? "active" : ""}`}
                                    onClick={() => setActiveTab(tab.id)}
                                    type="button"
                                    role="tab"
                                >
                                    <i className={`${tab.icon} me-2`}></i>
                                    {tab.label}
                                </button>
                            </li>
                        ))}
                    </ul>

                    <div className="table-content p-4 mt-0">
                        <form onSubmit={handleSubmit}>
                            {/* --- WEBSITE INFO --- */}
                            {activeTab === "website" && (
                                <div className="tab-pane fade show active">
                                    <h6 className="mb-4 cr-blue d-flex align-items-center gap-2">
                                        <i className="fal fa-globe fsz-14"></i>
                                        Website Configuration
                                    </h6>
                                    <div className="row g-3">
                                        <div className="col-md-6">
                                            <label className="form-label fsz-12 text-muted">Website Name</label>
                                            <input type="text" className="form-control" name="websiteName" value={formData.websiteName} onChange={handleChange} />
                                        </div>
                                        <div className="col-md-6">
                                            <label className="form-label fsz-12 text-muted">Keywords</label>
                                            <input type="text" className="form-control" name="keywords" value={formData.keywords} onChange={handleChange} />
                                        </div>
                                        <div className="col-md-4">
                                            <label className="form-label fsz-12 text-muted">Meta Description</label>
                                            <input type="text" className="form-control" name="metaDescription" value={formData.metaDescription} onChange={handleChange} />
                                        </div>
                                        <div className="col-md-4">
                                            <label className="form-label fsz-12 text-muted">Website Phone</label>
                                            <input type="text" className="form-control" name="websitePhone" value={formData.websitePhone} onChange={handleChange} />
                                        </div>
                                        <div className="col-md-4">
                                            <label className="form-label fsz-12 text-muted">Website Email</label>
                                            <input type="email" className="form-control" name="websiteEmail" value={formData.websiteEmail} onChange={handleChange} />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* --- MAIL SETTINGS --- */}
                            {activeTab === "mail" && (
                                <div className="tab-pane fade show active">
                                    <h6 className="mb-4 cr-blue d-flex align-items-center gap-2">
                                        <i className="fal fa-envelope fsz-14"></i>
                                        Mail Configuration (SMTP)
                                    </h6>
                                    <div className="row g-3">
                                        <div className="col-md-4">
                                            <label className="form-label fsz-12 text-muted">Mail Driver</label>
                                            <input type="text" className="form-control" name="mailDriver" value={formData.mailDriver} onChange={handleChange} />
                                        </div>
                                        <div className="col-md-4">
                                            <label className="form-label fsz-12 text-muted">Mail Host</label>
                                            <input type="text" className="form-control" name="mailHost" value={formData.mailHost} onChange={handleChange} />
                                        </div>
                                        <div className="col-md-4">
                                            <label className="form-label fsz-12 text-muted">Mail Port</label>
                                            <input type="text" className="form-control" name="mailPort" value={formData.mailPort} onChange={handleChange} />
                                        </div>
                                        <div className="col-md-4">
                                            <label className="form-label fsz-12 text-muted">Mail Username</label>
                                            <input type="text" className="form-control" name="mailUsername" value={formData.mailUsername} onChange={handleChange} />
                                        </div>
                                        <div className="col-md-4">
                                            <label className="form-label fsz-12 text-muted">Mail Password</label>
                                            <input type="password" className="form-control" name="mailPassword" placeholder="••••••••••••••••" onChange={handleChange} />
                                        </div>
                                        <div className="col-md-4">
                                            <label className="form-label fsz-12 text-muted">Mail Encryption</label>
                                            <input type="text" className="form-control" name="mailEncryption" value={formData.mailEncryption} onChange={handleChange} />
                                        </div>
                                        <div className="col-md-6">
                                            <label className="form-label fsz-12 text-muted">Mail From Address</label>
                                            <input type="email" className="form-control" name="mailFromAddress" value={formData.mailFromAddress} onChange={handleChange} />
                                        </div>
                                        <div className="col-md-6">
                                            <label className="form-label fsz-12 text-muted">Mail From Name</label>
                                            <input type="text" className="form-control" name="mailFromName" value={formData.mailFromName} onChange={handleChange} />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* --- VIDEO INTRODUCTIONS --- */}
                            {activeTab === "videos" && (
                                <div className="tab-pane fade show active">
                                    <h6 className="mb-4 cr-blue d-flex align-items-center gap-2">
                                        <i className="fal fa-video fsz-14"></i>
                                        Intro Videos Configuration
                                    </h6>
                                    <div className="row g-3">
                                        {modules.map((mod) => (
                                            <div className="col-lg-4" key={mod}>
                                                <FileUpload
                                                    files={formData.videoFiles[mod] || []}
                                                    onFilesChange={(files) => handleVideoChange(mod, files)}
                                                    maxFiles={1}
                                                    title={`Intro ${mod} Module Video`}
                                                    hint="Videos (Max 1)"
                                                    accept={{
                                                        'video/*': ['.mp4', '.webm', '.ogg', '.mov', '.avi']
                                                    }}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="mt-5 mb-4 text-center">
                                <button type="submit" className="butn-st2 d-inline-flex align-items-center gap-2 after-none">
                                    <i className="fal fa-check-circle"></i>
                                    <span>Save Settings</span>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </>
    );
}
