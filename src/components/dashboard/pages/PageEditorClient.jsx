"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import HomeEditor from "./home/Editor";
import GroupHistoryEditor from "./group-history/Editor";
import IndustriesEditor from "./industries/Editor";
import CompanyDirectoryEditor from "./company-directory/Editor";
import ProjectExperienceEditor from "./project-experience/Editor";
import ClientsPartnersEditor from "./clients-partners/Editor";
import SustainabilityEditor from "./sustainability/Editor";
import MediaCenterEditor from "./media-center/Editor";
import CareersEditor from "./careers/Editor";
import DownloadsEditor from "./downloads/Editor";
import ContactEditor from "./contact/Editor";

const EDITORS = {
    1: HomeEditor,
    2: GroupHistoryEditor,
    3: IndustriesEditor,
    4: CompanyDirectoryEditor,
    5: ProjectExperienceEditor,
    6: ClientsPartnersEditor,
    7: SustainabilityEditor,
    8: MediaCenterEditor,
    9: CareersEditor,
    10: DownloadsEditor,
    11: ContactEditor,
};

export default function PageEditorClient() {
    const params = useParams();
    const pageId = Number(params?.id);
    const Editor = EDITORS[pageId];

    if (!Editor) {
        return (
            <div className="text-center py-5">
                <p className="text-muted mb-3">Page editor not found</p>
                <Link href="/dashboard/pages" className="btn btn-outline-secondary btn-sm">
                    Back to Pages
                </Link>
            </div>
        );
    }

    return <Editor />;
}
