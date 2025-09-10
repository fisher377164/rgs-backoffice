"use client";

import { useState } from "react";
import { initialPlugins } from "@/lib/mock";
import { Plugin } from "@/lib/types";
import { filterPlugins } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { Card, CardContent } from "@/components/ui/Card";
import { Table, THead, TBody, Tr, Th, Td } from "@/components/ui/Table";
import { Pagination } from "@/components/ui/Pagination";
import { DropdownMenu, DropdownMenuItem } from "@/components/ui/DropdownMenu";
import { Modal } from "@/components/ui/Modal";
import { MoreHorizontal } from "lucide-react";

export default function ConfigurationPage() {
  const [plugins, setPlugins] = useState<Plugin[]>(initialPlugins);
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [editing, setEditing] = useState<Plugin | null>(null);
  const [form, setForm] = useState<Plugin | null>(null);
  const pageSize = 10;

  const filtered = filterPlugins(plugins, query);
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const start = (page - 1) * pageSize;
  const current = filtered.slice(start, start + pageSize);

  const openEdit = (plugin: Plugin) => {
    setForm(plugin);
    setEditing(plugin);
  };

  const saveEdit = () => {
    if (form) {
      setPlugins((plugs) =>
        plugs.map((p) => (p.id === form.id ? form : p))
      );
    }
    setEditing(null);
  };

  const toggleStatus = (plugin: Plugin) => {
    setPlugins((plugs) =>
      plugs.map((p) =>
        p.id === plugin.id
          ? { ...p, status: p.status === "Enabled" ? "Disabled" : "Enabled" }
          : p
      )
    );
  };

  const deletePlugin = (plugin: Plugin) => {
    if (window.confirm("Delete plugin?")) {
      setPlugins((plugs) => plugs.filter((p) => p.id !== plugin.id));
    }
  };

  return (
    <>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-semibold">Builder Configuration</h1>
        <div className="flex items-center gap-2">
          <Input
            placeholder="Search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Search plugins"
            className="w-48"
          />
          <Button aria-label="Create plugin">Create plugin</Button>
        </div>
      </div>
      <Card>
        {current.length ? (
          <Table className="min-w-full" aria-label="Plugins table">
            <THead>
              <Tr>
                <Th>Plugin</Th>
                <Th>Version</Th>
                <Th>Order</Th>
                <Th>Phase</Th>
                <Th>Requires</Th>
                <Th>Status</Th>
                <Th>Actions</Th>
              </Tr>
            </THead>
            <TBody>
              {current.map((plugin) => (
                <Tr key={plugin.id}>
                  <Td>{plugin.name}</Td>
                  <Td>{plugin.version}</Td>
                  <Td>{plugin.order}</Td>
                  <Td>{plugin.phase}</Td>
                  <Td>{plugin.requires || "—"}</Td>
                  <Td>
                    <Badge
                      className={
                        plugin.status === "Enabled"
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }
                    >
                      {plugin.status}
                    </Badge>
                  </Td>
                  <Td className="text-right">
                    <DropdownMenu label={<MoreHorizontal className="h-4 w-4" />}>
                      <DropdownMenuItem onSelect={() => openEdit(plugin)}>
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem onSelect={() => toggleStatus(plugin)}>
                        {plugin.status === "Enabled" ? "Disable" : "Enable"}
                      </DropdownMenuItem>
                      <DropdownMenuItem onSelect={() => deletePlugin(plugin)}>
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenu>
                  </Td>
                </Tr>
              ))}
            </TBody>
          </Table>
        ) : (
          <CardContent className="text-center text-sm text-gray-500">
            No plugins found.
          </CardContent>
        )}
      </Card>
      <Pagination
        page={page}
        totalPages={totalPages}
        onPageChange={setPage}
        className="mt-4"
      />
      <Modal
        open={!!editing}
        title="Edit Plugin"
        onClose={() => setEditing(null)}
        onSave={saveEdit}
      >
        {form && (
          <form className="space-y-2">
            <div>
              <label className="block text-sm font-medium">Name</label>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
            <div className="flex gap-2">
              <div className="flex-1">
                <label className="block text-sm font-medium">Version</label>
                <Input
                  value={form.version}
                  onChange={(e) => setForm({ ...form, version: e.target.value })}
                />
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium">Order</label>
                <Input
                  type="number"
                  value={form.order}
                  onChange={(e) =>
                    setForm({ ...form, order: Number(e.target.value) })
                  }
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium">Phase</label>
              <Input
                value={form.phase}
                onChange={(e) =>
                  setForm({ ...form, phase: e.target.value as Plugin["phase"] })
                }
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Requires</label>
              <Input
                value={form.requires || ""}
                onChange={(e) =>
                  setForm({ ...form, requires: e.target.value })
                }
              />
            </div>
          </form>
        )}
      </Modal>
    </>
  );
}
