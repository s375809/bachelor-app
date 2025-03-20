"use client"

import { useState, useEffect } from "react"
import { format } from "date-fns"
import { nb } from "date-fns/locale"
import { Download, Filter, Search, FileText, ChevronDown, ChevronUp, Check, X } from "lucide-react"
import { MainHeader } from "@/components/main-header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { CASES, TIME_ENTRIES } from "@/data/dummy-data"
import type { Case, TimeEntry } from "@/types/time-tracking"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { toast } from "@/components/ui/use-toast"
import { Toaster } from "@/components/ui/toaster"

// Helper function to format hours without unnecessary decimals
const formatHours = (hours: number): string => {
  return hours % 1 === 0 ? `${Math.floor(hours)}` : `${hours.toFixed(2)}`
}

// Helper function to calculate total hours for a case
const calculateTotalHours = (entries: TimeEntry[], caseId: string, onlyBillable = false) => {
  return entries
    .filter((entry) => entry.caseId === caseId && (!onlyBillable || entry.billable))
    .reduce((total, entry) => total + entry.hours, 0)
}

// Helper function to calculate total amount for a case
const calculateTotalAmount = (entries: TimeEntry[], caseId: string, hourlyRate = 1500) => {
  const billableHours = entries
    .filter((entry) => entry.caseId === caseId && entry.billable)
    .reduce((total, entry) => total + entry.hours, 0)

  return billableHours * hourlyRate
}

// Helper function to format amount as currency
const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat("nb-NO", { style: "currency", currency: "NOK" }).format(amount)
}

// Interface for invoice data
interface InvoiceData {
  id: string
  caseId: string
  status: "draft" | "sent" | "paid" | "overdue"
  amount: number
  date: Date
  dueDate: Date
  invoiceNumber: string
}

export default function BillingPage() {
  const [cases, setCases] = useState<Case[]>([])
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string[]>([])
  const [sortColumn, setSortColumn] = useState<string>("case")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc")
  const [selectedPeriod, setSelectedPeriod] = useState<string>("all")
  const [invoices, setInvoices] = useState<InvoiceData[]>([])

  // Dialog states
  const [isNewInvoiceDialogOpen, setIsNewInvoiceDialogOpen] = useState(false)
  const [selectedCaseForInvoice, setSelectedCaseForInvoice] = useState<string | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [invoiceToDelete, setInvoiceToDelete] = useState<string | null>(null)
  const [isDownloadDialogOpen, setIsDownloadDialogOpen] = useState(false)
  const [invoiceToDownload, setInvoiceToDownload] = useState<string | null>(null)
  const [isApproveDialogOpen, setIsApproveDialogOpen] = useState(false)
  const [invoiceToApprove, setInvoiceToApprove] = useState<string | null>(null)

  // Initialize data
  useEffect(() => {
    setCases(CASES)
    setTimeEntries(TIME_ENTRIES)

    // Generate sample invoices
    const sampleInvoices: InvoiceData[] = [
      {
        id: "inv1",
        caseId: "sak9",
        status: "paid",
        amount: 25000,
        date: new Date(2024, 1, 15),
        dueDate: new Date(2024, 2, 15),
        invoiceNumber: "F-2024-001",
      },
      {
        id: "inv2",
        caseId: "sak33",
        status: "sent",
        amount: 12500,
        date: new Date(2024, 2, 1),
        dueDate: new Date(2024, 3, 1),
        invoiceNumber: "F-2024-002",
      },
      {
        id: "inv3",
        caseId: "sak286",
        status: "draft",
        amount: 18750,
        date: new Date(2024, 2, 10),
        dueDate: new Date(2024, 3, 10),
        invoiceNumber: "F-2024-003",
      },
      {
        id: "inv4",
        caseId: "sak14",
        status: "overdue",
        amount: 9000,
        date: new Date(2024, 1, 1),
        dueDate: new Date(2024, 2, 1),
        invoiceNumber: "F-2024-004",
      },
    ]

    setInvoices(sampleInvoices)
  }, [])

  // Filter cases based on search query
  const filteredCases = cases.filter((caseItem) => {
    if (!searchQuery) return true

    const query = searchQuery.toLowerCase()
    return (
      caseItem.name.toLowerCase().includes(query) ||
      caseItem.clientName.toLowerCase().includes(query) ||
      caseItem.caseNumber.toLowerCase().includes(query)
    )
  })

  // Filter invoices based on status filter and search query
  const filteredInvoices = invoices.filter((invoice) => {
    // Status filter
    if (statusFilter.length > 0 && !statusFilter.includes(invoice.status)) {
      return false
    }

    // Search query
    if (searchQuery) {
      const caseItem = cases.find((c) => c.id === invoice.caseId)
      if (!caseItem) return false

      const query = searchQuery.toLowerCase()
      return (
        caseItem.name.toLowerCase().includes(query) ||
        caseItem.clientName.toLowerCase().includes(query) ||
        caseItem.caseNumber.toLowerCase().includes(query) ||
        invoice.invoiceNumber.toLowerCase().includes(query)
      )
    }

    return true
  })

  // Sort cases
  const sortedCases = [...filteredCases].sort((a, b) => {
    if (sortColumn === "case") {
      const comparison = a.name.localeCompare(b.name)
      return sortDirection === "asc" ? comparison : -comparison
    } else if (sortColumn === "client") {
      const comparison = a.clientName.localeCompare(b.clientName)
      return sortDirection === "asc" ? comparison : -comparison
    } else if (sortColumn === "hours") {
      const hoursA = calculateTotalHours(timeEntries, a.id)
      const hoursB = calculateTotalHours(timeEntries, b.id)
      return sortDirection === "asc" ? hoursA - hoursB : hoursB - hoursA
    } else if (sortColumn === "amount") {
      const amountA = calculateTotalAmount(timeEntries, a.id)
      const amountB = calculateTotalAmount(timeEntries, b.id)
      return sortDirection === "asc" ? amountA - amountB : amountB - amountA
    }
    return 0
  })

  // Handle sort click
  const handleSortClick = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortColumn(column)
      setSortDirection("asc")
    }
  }

  // Get sort icon
  const getSortIcon = (column: string) => {
    if (sortColumn !== column) return null
    return sortDirection === "asc" ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
  }

  // Get status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "draft":
        return (
          <Badge variant="outline" className="bg-gray-100">
            Utkast
          </Badge>
        )
      case "sent":
        return (
          <Badge variant="outline" className="bg-blue-100 text-blue-800">
            Sendt
          </Badge>
        )
      case "paid":
        return (
          <Badge variant="outline" className="bg-green-100 text-green-800">
            Betalt
          </Badge>
        )
      case "overdue":
        return (
          <Badge variant="outline" className="bg-red-100 text-red-800">
            Forfalt
          </Badge>
        )
      default:
        return null
    }
  }

  // Handle creating a new invoice
  const handleCreateInvoice = () => {
    if (!selectedCaseForInvoice) return

    const caseDetails = cases.find((c) => c.id === selectedCaseForInvoice)
    if (!caseDetails) return

    const amount = calculateTotalAmount(timeEntries, selectedCaseForInvoice)
    const today = new Date()
    const dueDate = new Date()
    dueDate.setDate(today.getDate() + 30) // Due in 30 days

    const newInvoice: InvoiceData = {
      id: `inv${Date.now()}`,
      caseId: selectedCaseForInvoice,
      status: "draft",
      amount,
      date: today,
      dueDate,
      invoiceNumber: `F-${today.getFullYear()}-${invoices.length + 1}`.padEnd(10, "0"),
    }

    setInvoices((prev) => [...prev, newInvoice])
    setIsNewInvoiceDialogOpen(false)
    setSelectedCaseForInvoice(null)

    toast({
      title: "Faktura opprettet",
      description: `Faktura for ${caseDetails.name} er opprettet som utkast.`,
    })
  }

  // Handle approving an invoice
  const handleApproveInvoice = () => {
    if (!invoiceToApprove) return

    setInvoices((prev) =>
      prev.map((invoice) => (invoice.id === invoiceToApprove ? { ...invoice, status: "sent" } : invoice)),
    )

    setIsApproveDialogOpen(false)
    setInvoiceToApprove(null)

    toast({
      title: "Faktura sendt",
      description: "Fakturaen er nå markert som sendt.",
    })
  }

  // Handle deleting an invoice
  const handleDeleteInvoice = () => {
    if (!invoiceToDelete) return

    setInvoices((prev) => prev.filter((invoice) => invoice.id !== invoiceToDelete))
    setIsDeleteDialogOpen(false)
    setInvoiceToDelete(null)

    toast({
      title: "Faktura slettet",
      description: "Fakturaen er nå slettet.",
    })
  }

  // Handle downloading an invoice
  const handleDownloadInvoice = () => {
    if (!invoiceToDownload) return

    const invoice = invoices.find((inv) => inv.id === invoiceToDownload)
    if (!invoice) return

    setIsDownloadDialogOpen(false)
    setInvoiceToDownload(null)

    toast({
      title: "Faktura lastet ned",
      description: `Faktura ${invoice.invoiceNumber} er lastet ned.`,
    })
  }

  // Handle creating a new general invoice
  const handleCreateNewInvoice = () => {
    toast({
      title: "Ny faktura",
      description: "Velg en sak fra listen nedenfor for å opprette en faktura.",
    })
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <MainHeader />
      <main className="flex-1 p-4 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <h1 className="text-2xl font-bold text-gray-800">Fakturering</h1>
          <div className="flex flex-wrap gap-2">
            <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Velg periode" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Alle perioder</SelectItem>
                <SelectItem value="current-month">Denne måneden</SelectItem>
                <SelectItem value="last-month">Forrige måned</SelectItem>
                <SelectItem value="current-quarter">Dette kvartalet</SelectItem>
                <SelectItem value="last-quarter">Forrige kvartal</SelectItem>
              </SelectContent>
            </Select>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  <span>Status</span>
                  {statusFilter.length > 0 && <Badge className="ml-1 bg-blue-600">{statusFilter.length}</Badge>}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuCheckboxItem
                  checked={statusFilter.includes("draft")}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setStatusFilter([...statusFilter, "draft"])
                    } else {
                      setStatusFilter(statusFilter.filter((s) => s !== "draft"))
                    }
                  }}
                >
                  Utkast
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={statusFilter.includes("sent")}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setStatusFilter([...statusFilter, "sent"])
                    } else {
                      setStatusFilter(statusFilter.filter((s) => s !== "sent"))
                    }
                  }}
                >
                  Sendt
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={statusFilter.includes("paid")}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setStatusFilter([...statusFilter, "paid"])
                    } else {
                      setStatusFilter(statusFilter.filter((s) => s !== "paid"))
                    }
                  }}
                >
                  Betalt
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={statusFilter.includes("overdue")}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setStatusFilter([...statusFilter, "overdue"])
                    } else {
                      setStatusFilter(statusFilter.filter((s) => s !== "overdue"))
                    }
                  }}
                >
                  Forfalt
                </DropdownMenuCheckboxItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Søk etter sak eller klient..."
                className="pl-10 w-full md:w-[300px]"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <Button className="bg-blue-600 hover:bg-blue-700 text-white" onClick={handleCreateNewInvoice}>
              <FileText className="h-4 w-4 mr-2" />
              Ny faktura
            </Button>
          </div>
        </div>

        {/* Fakturaer */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-lg font-bold text-gray-800">Fakturaer</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 text-xs uppercase text-gray-700">
                <tr>
                  <th className="px-4 py-3 text-left">Fakturanr.</th>
                  <th className="px-4 py-3 text-left">
                    <button className="flex items-center gap-1" onClick={() => handleSortClick("case")}>
                      Sak {getSortIcon("case")}
                    </button>
                  </th>
                  <th className="px-4 py-3 text-left">
                    <button className="flex items-center gap-1" onClick={() => handleSortClick("client")}>
                      Klient {getSortIcon("client")}
                    </button>
                  </th>
                  <th className="px-4 py-3 text-center">Status</th>
                  <th className="px-4 py-3 text-center">Dato</th>
                  <th className="px-4 py-3 text-center">Forfallsdato</th>
                  <th className="px-4 py-3 text-right">
                    <button className="flex items-center gap-1 ml-auto" onClick={() => handleSortClick("amount")}>
                      Beløp {getSortIcon("amount")}
                    </button>
                  </th>
                  <th className="px-4 py-3 text-right">Handlinger</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredInvoices.map((invoice) => {
                  const caseDetails = cases.find((c) => c.id === invoice.caseId)
                  return (
                    <tr key={invoice.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm font-medium">{invoice.invoiceNumber}</td>
                      <td className="px-4 py-3 text-sm">
                        {caseDetails ? (
                          <div>
                            <div className="font-medium">{caseDetails.name}</div>
                            <div className="text-xs text-gray-500">{caseDetails.caseNumber}</div>
                          </div>
                        ) : (
                          "Ukjent sak"
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm">{caseDetails?.clientName || "Ukjent klient"}</td>
                      <td className="px-4 py-3 text-sm text-center">{getStatusBadge(invoice.status)}</td>
                      <td className="px-4 py-3 text-sm text-center">
                        {format(invoice.date, "dd.MM.yyyy", { locale: nb })}
                      </td>
                      <td className="px-4 py-3 text-sm text-center">
                        {format(invoice.dueDate, "dd.MM.yyyy", { locale: nb })}
                      </td>
                      <td className="px-4 py-3 text-sm text-right font-medium">{formatCurrency(invoice.amount)}</td>
                      <td className="px-4 py-3 text-sm text-right">
                        <div className="flex justify-end space-x-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-gray-500 hover:text-blue-600"
                            onClick={() => {
                              setInvoiceToDownload(invoice.id)
                              setIsDownloadDialogOpen(true)
                            }}
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                          {invoice.status === "draft" && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-gray-500 hover:text-green-600"
                              onClick={() => {
                                setInvoiceToApprove(invoice.id)
                                setIsApproveDialogOpen(true)
                              }}
                            >
                              <Check className="h-4 w-4" />
                            </Button>
                          )}
                          {invoice.status === "draft" && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-gray-500 hover:text-red-600"
                              onClick={() => {
                                setInvoiceToDelete(invoice.id)
                                setIsDeleteDialogOpen(true)
                              }}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Fakturerbare timer */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-lg font-bold text-gray-800">Fakturerbare timer</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 text-xs uppercase text-gray-700">
                <tr>
                  <th className="px-4 py-3 text-left">
                    <button className="flex items-center gap-1" onClick={() => handleSortClick("case")}>
                      Sak {getSortIcon("case")}
                    </button>
                  </th>
                  <th className="px-4 py-3 text-left">
                    <button className="flex items-center gap-1" onClick={() => handleSortClick("client")}>
                      Klient {getSortIcon("client")}
                    </button>
                  </th>
                  <th className="px-4 py-3 text-center">
                    <button className="flex items-center gap-1" onClick={() => handleSortClick("hours")}>
                      Timer {getSortIcon("hours")}
                    </button>
                  </th>
                  <th className="px-4 py-3 text-right">
                    <button className="flex items-center gap-1 ml-auto" onClick={() => handleSortClick("amount")}>
                      Beløp {getSortIcon("amount")}
                    </button>
                  </th>
                  <th className="px-4 py-3 text-right">Handlinger</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {sortedCases.map((caseItem) => {
                  const totalHours = calculateTotalHours(timeEntries, caseItem.id, true)
                  const totalAmount = calculateTotalAmount(timeEntries, caseItem.id)

                  // Skip cases with no billable hours
                  if (totalHours === 0) return null

                  return (
                    <tr key={caseItem.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm">
                        <div className="font-medium">{caseItem.name}</div>
                        <div className="text-xs text-gray-500">{caseItem.caseNumber}</div>
                      </td>
                      <td className="px-4 py-3 text-sm">{caseItem.clientName}</td>
                      <td className="px-4 py-3 text-sm text-center font-medium">{formatHours(totalHours)}t</td>
                      <td className="px-4 py-3 text-sm text-right font-medium">{formatCurrency(totalAmount)}</td>
                      <td className="px-4 py-3 text-sm text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-blue-600 border-blue-600 hover:bg-blue-50"
                          onClick={() => {
                            setSelectedCaseForInvoice(caseItem.id)
                            setIsNewInvoiceDialogOpen(true)
                          }}
                        >
                          <FileText className="h-4 w-4 mr-2" />
                          Opprett faktura
                        </Button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* New Invoice Dialog */}
      <Dialog open={isNewInvoiceDialogOpen} onOpenChange={setIsNewInvoiceDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Opprett ny faktura</DialogTitle>
            <DialogDescription>Du er i ferd med å opprette en ny faktura for denne saken.</DialogDescription>
          </DialogHeader>

          {selectedCaseForInvoice && (
            <div className="py-4">
              <div className="grid gap-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <div className="text-right font-medium">Sak:</div>
                  <div className="col-span-3">{cases.find((c) => c.id === selectedCaseForInvoice)?.name}</div>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <div className="text-right font-medium">Klient:</div>
                  <div className="col-span-3">{cases.find((c) => c.id === selectedCaseForInvoice)?.clientName}</div>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <div className="text-right font-medium">Timer:</div>
                  <div className="col-span-3">
                    {formatHours(calculateTotalHours(timeEntries, selectedCaseForInvoice, true))}t
                  </div>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <div className="text-right font-medium">Beløp:</div>
                  <div className="col-span-3 font-bold">
                    {formatCurrency(calculateTotalAmount(timeEntries, selectedCaseForInvoice))}
                  </div>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Avbryt</Button>
            </DialogClose>
            <Button onClick={handleCreateInvoice}>Opprett faktura</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Download Invoice Dialog */}
      <Dialog open={isDownloadDialogOpen} onOpenChange={setIsDownloadDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Last ned faktura</DialogTitle>
            <DialogDescription>Velg format for nedlasting av faktura.</DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <div className="grid grid-cols-2 gap-4">
              <Button
                variant="outline"
                className="h-24 flex flex-col items-center justify-center"
                onClick={handleDownloadInvoice}
              >
                <FileText className="h-8 w-8 mb-2" />
                <span>PDF</span>
              </Button>
              <Button
                variant="outline"
                className="h-24 flex flex-col items-center justify-center"
                onClick={handleDownloadInvoice}
              >
                <FileText className="h-8 w-8 mb-2" />
                <span>Excel</span>
              </Button>
            </div>
          </div>

          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Avbryt</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Approve Invoice Alert Dialog */}
      <AlertDialog open={isApproveDialogOpen} onOpenChange={setIsApproveDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Send faktura</AlertDialogTitle>
            <AlertDialogDescription>
              Er du sikker på at du vil sende denne fakturaen? Dette vil endre status fra utkast til sendt.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Avbryt</AlertDialogCancel>
            <AlertDialogAction onClick={handleApproveInvoice}>Send faktura</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Invoice Alert Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Slett faktura</AlertDialogTitle>
            <AlertDialogDescription>
              Er du sikker på at du vil slette denne fakturaen? Denne handlingen kan ikke angres.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Avbryt</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteInvoice} className="bg-red-600 hover:bg-red-700">
              Slett faktura
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Toaster />
    </div>
  )
}

