'use client' // Error boundaries must be Client Components

import React, { useEffect } from 'react'
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import ComponentCard from "@/components/common/ComponentCard";
import Alert from "@/components/ui/alert/Alert";

export default function Error({
                                  error,
                              }: {
    error: Error & { digest?: string }
    reset: () => void
}) {
    useEffect(() => {
        // Log the error to an error reporting service
        console.error(error)
    }, [error])

    return (

        <div>
            <PageBreadcrumb
                pageTitle="All plugins"
                breadcrumbs={[
                    { label: "Builder", href: "/builder" },
                    { label: "Plugins" },
                ]}
            />
            <div className="space-y-6">
                <ComponentCard title="Games">
                    <Alert
                        variant="error"
                        title={error.name}
                        message={error.message}
                        showLink={false}
                    />
                </ComponentCard>
            </div>
        </div>

    )
}
