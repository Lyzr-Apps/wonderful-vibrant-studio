'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { CheckCircle, AlertCircle, Clock, Users, FileText, Zap, Menu, X, Upload, Calendar } from 'lucide-react'

// Types
interface Candidate {
  id: string
  name: string
  email: string
  role: string
  department: string
  startDate: string
  status: 'pending' | 'welcome_sent' | 'documents_received' | 'tasks_assigned' | 'completed'
  progress: number
}

interface Document {
  id: string
  candidateId: string
  type: string
  filename: string
  uploadDate: string
  status: 'pending' | 'valid' | 'invalid'
}

interface OnboardingTask {
  id: string
  candidateId: string
  title: string
  department: string
  assignee: string
  dueDate: string
  priority: 'high' | 'medium' | 'low'
  status: 'pending' | 'in_progress' | 'completed'
}

// Utility function to call agents
async function callAgent(agentId: string, message: string, inputData?: any) {
  try {
    const response = await fetch('/api/agent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message,
        agent_id: agentId,
        context_data: inputData
      })
    })

    const data = await response.json()
    return data.response ?? data.raw_response
  } catch (error) {
    console.error('Agent call failed:', error)
    return null
  }
}

// Dashboard Component
function Dashboard({ candidates, onNewOnboarding, onInitiate }: any) {
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: '',
    department: '',
    startDate: ''
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (formData.name && formData.email && formData.role && formData.department && formData.startDate) {
      onNewOnboarding(formData)
      setFormData({ name: '', email: '', role: '', department: '', startDate: '' })
      setShowForm(false)
    }
  }

  const activeCount = candidates.filter((c: Candidate) => c.status !== 'completed').length
  const pendingDocs = candidates.filter((c: Candidate) => c.status === 'welcome_sent').length
  const overdueTasks = candidates.filter((c: Candidate) => c.progress < 50 && c.status !== 'pending').length
  const completedThisMonth = candidates.filter((c: Candidate) => c.status === 'completed').length

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-700">Active Onboardings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">{activeCount}</div>
            <p className="text-xs text-gray-600 mt-1">In progress</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-700">Pending Documents</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-600">{pendingDocs}</div>
            <p className="text-xs text-gray-600 mt-1">Awaiting submission</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-700">At Risk Tasks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">{overdueTasks}</div>
            <p className="text-xs text-gray-600 mt-1">Behind schedule</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-700">Completed This Month</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{completedThisMonth}</div>
            <p className="text-xs text-gray-600 mt-1">Successfully onboarded</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <div>
                <CardTitle>Active Onboardings</CardTitle>
                <CardDescription>Manage candidate onboarding progress</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              {candidates.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No onboardings yet. Add a new candidate to get started.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {candidates.map((candidate: Candidate) => (
                    <div key={candidate.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition">
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900">{candidate.name}</h4>
                        <p className="text-sm text-gray-600">{candidate.role} • {candidate.department}</p>
                        <p className="text-xs text-gray-500 mt-1">Start date: {candidate.startDate}</p>
                        <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                          <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${candidate.progress}%` }}></div>
                        </div>
                      </div>
                      <div className="ml-4 flex flex-col items-end gap-2">
                        <Badge variant={candidate.status === 'completed' ? 'default' : 'secondary'}>
                          {candidate.status.replace(/_/g, ' ')}
                        </Badge>
                        {candidate.status === 'pending' && (
                          <Button size="sm" onClick={() => onInitiate(candidate.id)}>
                            Initiate
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Quick Add</CardTitle>
              <CardDescription>Add a new candidate</CardDescription>
            </CardHeader>
            <CardContent>
              <Dialog open={showForm} onOpenChange={setShowForm}>
                <DialogTrigger asChild>
                  <Button className="w-full">New Onboarding</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add New Candidate</DialogTitle>
                    <DialogDescription>Fill in the candidate details to start onboarding</DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700">Name</label>
                      <Input
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="John Smith"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Email</label>
                      <Input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="john@example.com"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Role</label>
                      <Select value={formData.role} onValueChange={(value) => setFormData({ ...formData, role: value })}>
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="Select role" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Software Engineer">Software Engineer</SelectItem>
                          <SelectItem value="Product Manager">Product Manager</SelectItem>
                          <SelectItem value="Designer">Designer</SelectItem>
                          <SelectItem value="Sales Manager">Sales Manager</SelectItem>
                          <SelectItem value="HR Coordinator">HR Coordinator</SelectItem>
                          <SelectItem value="Accountant">Accountant</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Department</label>
                      <Select value={formData.department} onValueChange={(value) => setFormData({ ...formData, department: value })}>
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="Select department" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Engineering">Engineering</SelectItem>
                          <SelectItem value="Sales">Sales</SelectItem>
                          <SelectItem value="Marketing">Marketing</SelectItem>
                          <SelectItem value="Finance">Finance</SelectItem>
                          <SelectItem value="HR">HR</SelectItem>
                          <SelectItem value="Operations">Operations</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Start Date</label>
                      <Input
                        type="date"
                        value={formData.startDate}
                        onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                        className="mt-1"
                      />
                    </div>
                    <Button type="submit" className="w-full">Add Candidate</Button>
                  </form>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

// Document Hub Component
function DocumentHub({ candidates, onProcessDocuments }: any) {
  const [selectedCandidate, setSelectedCandidate] = useState<string>('')
  const [documents, setDocuments] = useState<Document[]>([])
  const [validationResult, setValidationResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const requiredDocs = ['Government ID', 'Tax Forms', 'Direct Deposit Info', 'Emergency Contact']

  const handleUpload = (e: React.DragEvent | React.ChangeEvent) => {
    e.preventDefault()
    const files = 'dataTransfer' in e ? e.dataTransfer.files : (e.target as HTMLInputElement).files
    if (files && selectedCandidate) {
      Array.from(files).forEach((file) => {
        setDocuments([...documents, {
          id: Math.random().toString(),
          candidateId: selectedCandidate,
          type: file.name.includes('id') ? 'Government ID' : 'Other',
          filename: file.name,
          uploadDate: new Date().toISOString().split('T')[0],
          status: 'pending'
        }])
      })
    }
  }

  const handleProcessDocuments = async () => {
    if (!selectedCandidate) return
    setLoading(true)

    const candidate = candidates.find((c: Candidate) => c.id === selectedCandidate)
    const docData = {
      candidate_id: selectedCandidate,
      candidate_name: candidate?.name,
      role: candidate?.role,
      documents: documents.map(d => ({
        document_type: d.type,
        filename: d.filename,
        content: `Document: ${d.filename}`
      })),
      required_documents: requiredDocs
    }

    const result = await callAgent('693068ced4e9ae41a5a27a51', 'Process and validate these onboarding documents', docData)

    if (result?.result) {
      setValidationResult(result.result)
      setDocuments(documents.map(d => ({
        ...d,
        status: result.result.documents_validated?.some((v: any) => v.document_type === d.type) ? 'valid' : 'invalid'
      })))
    }
    setLoading(false)
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Document Processing</CardTitle>
          <CardDescription>Upload and validate candidate documents</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-2">Select Candidate</label>
                <Select value={selectedCandidate} onValueChange={setSelectedCandidate}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a candidate" />
                  </SelectTrigger>
                  <SelectContent>
                    {candidates.map((c: Candidate) => (
                      <SelectItem key={c.id} value={c.id}>{c.name} - {c.role}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div
                onDrop={handleUpload}
                onDragOver={(e) => e.preventDefault()}
                className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center bg-gray-50 hover:bg-gray-100 transition cursor-pointer"
              >
                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600 font-medium">Drop documents here or click to browse</p>
                <p className="text-sm text-gray-500 mt-1">Supported: PDF, DOC, DOCX, Images</p>
                <input type="file" multiple onChange={handleUpload} className="hidden" accept=".pdf,.doc,.docx,.jpg,.png" />
              </div>

              {documents.length > 0 && (
                <div className="mt-4">
                  <h4 className="font-semibold text-gray-900 mb-3">Uploaded Documents ({documents.length})</h4>
                  <div className="space-y-2">
                    {documents.map((doc) => (
                      <div key={doc.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <FileText className="w-5 h-5 text-blue-600" />
                          <div>
                            <p className="text-sm font-medium text-gray-900">{doc.filename}</p>
                            <p className="text-xs text-gray-500">{doc.uploadDate}</p>
                          </div>
                        </div>
                        <Badge variant={doc.status === 'valid' ? 'default' : doc.status === 'invalid' ? 'destructive' : 'secondary'}>
                          {doc.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <Button onClick={handleProcessDocuments} disabled={!selectedCandidate || documents.length === 0 || loading} className="w-full mt-4">
                {loading ? 'Processing...' : 'Process Documents'}
              </Button>
            </div>

            <div>
              <Card className="bg-blue-50 border-blue-200">
                <CardHeader>
                  <CardTitle className="text-base">Required Documents</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {requiredDocs.map((doc) => (
                      <li key={doc} className="flex items-center gap-2 text-sm text-gray-700">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        {doc}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </CardContent>
      </Card>

      {validationResult && (
        <Card>
          <CardHeader>
            <CardTitle>Validation Results</CardTitle>
            <CardDescription>Document validation report for {validationResult.candidate_name}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-3 bg-blue-50 rounded-lg">
                <p className="text-xs text-gray-600">Submitted</p>
                <p className="text-lg font-semibold text-blue-600">{validationResult.validation_summary?.total_submitted}</p>
              </div>
              <div className="p-3 bg-green-50 rounded-lg">
                <p className="text-xs text-gray-600">Validated</p>
                <p className="text-lg font-semibold text-green-600">{validationResult.validation_summary?.total_validated}</p>
              </div>
              <div className="p-3 bg-orange-50 rounded-lg">
                <p className="text-xs text-gray-600">Missing</p>
                <p className="text-lg font-semibold text-orange-600">{validationResult.validation_summary?.total_missing}</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-600">Completion</p>
                <p className="text-lg font-semibold text-gray-600">{validationResult.validation_summary?.completion_percentage}%</p>
              </div>
            </div>

            {validationResult.missing_documents && validationResult.missing_documents.length > 0 && (
              <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                <p className="flex items-center gap-2 text-orange-900 font-medium mb-2">
                  <AlertCircle className="w-4 h-4" />
                  Missing Documents
                </p>
                <ul className="space-y-1 ml-6">
                  {validationResult.missing_documents.map((doc: string) => (
                    <li key={doc} className="text-sm text-orange-800">• {doc}</li>
                  ))}
                </ul>
              </div>
            )}

            {validationResult.action_items && (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="font-medium text-blue-900 mb-2">Action Items</p>
                <ul className="space-y-1 ml-6">
                  {validationResult.action_items.map((action: string, idx: number) => (
                    <li key={idx} className="text-sm text-blue-800">• {action}</li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}

// Task Management Component
function TaskManagement({ candidates, tasks, onAddTask, onGenerateTasks }: any) {
  const [selectedCandidate, setSelectedCandidate] = useState<string>('')
  const [loading, setLoading] = useState(false)

  const handleGenerateTasks = async () => {
    if (!selectedCandidate) return
    setLoading(true)

    const candidate = candidates.find((c: Candidate) => c.id === selectedCandidate)
    const taskData = {
      candidate_name: candidate?.name,
      role: candidate?.role,
      department: candidate?.department,
      start_date: candidate?.startDate,
      manager: 'Jane Doe',
      slack_channels: {
        it: '#it-requests',
        facilities: '#facilities',
        hr: '#hr-onboarding',
        engineering: '#engineering-team'
      }
    }

    const result = await callAgent('693068f4d4e9ae41a5a27a55', 'Generate onboarding tasks for this new hire', taskData)

    if (result?.result?.tasks_by_department) {
      onGenerateTasks(selectedCandidate, result.result)
    }
    setLoading(false)
  }

  const candidateTasks = tasks.filter((t: OnboardingTask) => t.candidateId === selectedCandidate)
  const byStatus = {
    pending: candidateTasks.filter((t: OnboardingTask) => t.status === 'pending'),
    in_progress: candidateTasks.filter((t: OnboardingTask) => t.status === 'in_progress'),
    completed: candidateTasks.filter((t: OnboardingTask) => t.status === 'completed')
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Task Management</CardTitle>
          <CardDescription>Generate and assign onboarding tasks</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-6">
            <div className="flex-1">
              <label className="text-sm font-medium text-gray-700 block mb-2">Select Candidate</label>
              <Select value={selectedCandidate} onValueChange={setSelectedCandidate}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a candidate" />
                </SelectTrigger>
                <SelectContent>
                  {candidates.map((c: Candidate) => (
                    <SelectItem key={c.id} value={c.id}>{c.name} - {c.role}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button onClick={handleGenerateTasks} disabled={!selectedCandidate || loading}>
                {loading ? 'Generating...' : 'Generate Tasks'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {selectedCandidate && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {(['pending', 'in_progress', 'completed'] as const).map((status) => (
            <Card key={status}>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">
                  {status === 'pending' ? 'Pending' : status === 'in_progress' ? 'In Progress' : 'Completed'} ({byStatus[status].length})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {byStatus[status].length === 0 ? (
                  <div className="text-center py-8">
                    <Clock className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                    <p className="text-sm text-gray-500">No tasks</p>
                  </div>
                ) : (
                  byStatus[status].map((task: OnboardingTask) => (
                    <div key={task.id} className="p-3 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition">
                      <p className="text-sm font-medium text-gray-900">{task.title}</p>
                      <p className="text-xs text-gray-600 mt-1">{task.department}</p>
                      <p className="text-xs text-gray-500 mt-1">Due: {task.dueDate}</p>
                      <Badge className="mt-2" variant={task.priority === 'high' ? 'destructive' : 'secondary'}>
                        {task.priority}
                      </Badge>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

// Progress Tracker Component
function ProgressTracker({ candidates }: any) {
  const [selectedCandidate, setSelectedCandidate] = useState<string>('')
  const [report, setReport] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const handleGenerateReport = async () => {
    if (!selectedCandidate) return
    setLoading(true)

    const candidate = candidates.find((c: Candidate) => c.id === selectedCandidate)
    const progressData = {
      candidate_id: selectedCandidate,
      candidate_name: candidate?.name,
      role: candidate?.role,
      department: candidate?.department,
      start_date: candidate?.startDate,
      current_date: new Date().toISOString().split('T')[0],
      tasks: [
        { task_id: 'IT-001', title: 'Setup laptop', department: 'IT', status: 'completed', due_date: candidate?.startDate, completed_date: new Date().toISOString().split('T')[0] },
        { task_id: 'FAC-001', title: 'Assign desk', department: 'Facilities', status: 'in_progress', due_date: candidate?.startDate, completed_date: null },
        { task_id: 'MGR-001', title: 'Team introduction', department: 'Manager', status: 'pending', due_date: candidate?.startDate, completed_date: null }
      ],
      documents: [
        { type: 'government_id', status: 'validated', submitted_date: new Date().toISOString().split('T')[0] },
        { type: 'tax_form', status: 'pending', submitted_date: null }
      ]
    }

    const result = await callAgent('6930690bde309976217c961d', 'Generate progress report for this onboarding', progressData)

    if (result?.result) {
      setReport(result.result)
    }
    setLoading(false)
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Progress Tracker</CardTitle>
          <CardDescription>Monitor onboarding completion and generate reports</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="text-sm font-medium text-gray-700 block mb-2">Select Candidate</label>
              <Select value={selectedCandidate} onValueChange={setSelectedCandidate}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a candidate" />
                </SelectTrigger>
                <SelectContent>
                  {candidates.map((c: Candidate) => (
                    <SelectItem key={c.id} value={c.id}>{c.name} - {c.role}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button onClick={handleGenerateReport} disabled={!selectedCandidate || loading}>
                {loading ? 'Generating...' : 'Generate Report'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {report && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Progress Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <p className="text-xs text-gray-600">Overall Progress</p>
                  <p className="text-2xl font-bold text-blue-600 mt-1">{report.progress_metrics?.overall_completion_percentage}%</p>
                </div>
                <div className="p-4 bg-green-50 rounded-lg">
                  <p className="text-xs text-gray-600">Tasks Complete</p>
                  <p className="text-2xl font-bold text-green-600 mt-1">{report.progress_metrics?.tasks_completed}/{report.progress_metrics?.tasks_total}</p>
                </div>
                <div className="p-4 bg-orange-50 rounded-lg">
                  <p className="text-xs text-gray-600">Documents</p>
                  <p className="text-2xl font-bold text-orange-600 mt-1">{report.progress_metrics?.documents_validated}/{report.progress_metrics?.documents_required}</p>
                </div>
                <div className="p-4 bg-purple-50 rounded-lg">
                  <p className="text-xs text-gray-600">Days to Start</p>
                  <p className="text-2xl font-bold text-purple-600 mt-1">{report.candidate_summary?.days_until_start}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {report.timeline && (
            <Card>
              <CardHeader>
                <CardTitle>Timeline</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-gray-900">Current Phase</p>
                  <p className="text-base text-blue-600 font-semibold">{report.timeline.current_phase}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900 mb-2">Milestones Completed</p>
                  <div className="space-y-1">
                    {report.timeline.milestones_completed?.map((milestone: string, idx: number) => (
                      <div key={idx} className="flex items-center gap-2 text-sm text-gray-700">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        {milestone}
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Next Milestone</p>
                  <p className="text-base text-orange-600">{report.timeline.next_milestone}</p>
                </div>
              </CardContent>
            </Card>
          )}

          {report.recommendations && report.recommendations.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Recommendations</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {report.recommendations.map((rec: any, idx: number) => (
                  <div key={idx} className="p-4 bg-blue-50 border-l-4 border-blue-600 rounded">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="font-medium text-gray-900 text-sm">{rec.action}</p>
                        <p className="text-xs text-gray-600 mt-1">Responsible: {rec.responsible}</p>
                      </div>
                      <Badge variant={rec.priority === 'high' ? 'destructive' : 'secondary'}>
                        {rec.priority}
                      </Badge>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  )
}

// Main App Component
export default function OnboardingHub() {
  const [currentTab, setCurrentTab] = useState('dashboard')
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [candidates, setCandidates] = useState<Candidate[]>([
    {
      id: '1',
      name: 'Sarah Johnson',
      email: 'sarah.johnson@email.com',
      role: 'Product Manager',
      department: 'Product',
      startDate: '2024-02-20',
      status: 'documents_received',
      progress: 65
    },
    {
      id: '2',
      name: 'Michael Chen',
      email: 'michael.chen@email.com',
      role: 'Software Engineer',
      department: 'Engineering',
      startDate: '2024-02-15',
      status: 'welcome_sent',
      progress: 40
    }
  ])
  const [tasks, setTasks] = useState<OnboardingTask[]>([
    {
      id: '1',
      candidateId: '1',
      title: 'Setup laptop and development environment',
      department: 'IT',
      assignee: 'IT Support Team',
      dueDate: '2024-02-19',
      priority: 'high',
      status: 'completed'
    },
    {
      id: '2',
      candidateId: '1',
      title: 'Prepare team introduction meeting',
      department: 'Product',
      assignee: 'John Smith',
      dueDate: '2024-02-20',
      priority: 'medium',
      status: 'pending'
    }
  ])

  const handleNewOnboarding = async (data: any) => {
    const newCandidate: Candidate = {
      id: Math.random().toString(),
      ...data,
      status: 'pending',
      progress: 0
    }
    setCandidates([...candidates, newCandidate])
  }

  const handleInitiate = async (candidateId: string) => {
    const candidate = candidates.find(c => c.id === candidateId)
    if (!candidate) return

    const welcomeData = {
      candidate_name: candidate.name,
      candidate_email: candidate.email,
      role: candidate.role,
      department: candidate.department,
      start_date: candidate.startDate,
      manager_name: 'Jane Doe'
    }

    const result = await callAgent('693068b9d4e9ae41a5a27a4a', 'Send personalized welcome email to this new hire', welcomeData)

    if (result?.result?.email_sent) {
      setCandidates(candidates.map(c =>
        c.id === candidateId
          ? { ...c, status: 'welcome_sent', progress: 25 }
          : c
      ))
    }
  }

  const handleGenerateTasks = (candidateId: string, taskResult: any) => {
    const newTasks: OnboardingTask[] = []
    Object.entries(taskResult.tasks_by_department || {}).forEach(([dept, deptTasks]: any) => {
      deptTasks.forEach((task: any) => {
        newTasks.push({
          id: Math.random().toString(),
          candidateId,
          title: task.task_title,
          department: dept,
          assignee: task.assignee,
          dueDate: task.due_date,
          priority: task.priority,
          status: task.status
        })
      })
    })

    setCandidates(candidates.map(c =>
      c.id === candidateId
        ? { ...c, status: 'tasks_assigned', progress: 60 }
        : c
    ))
    setTasks([...tasks, ...newTasks])
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-white border-r border-gray-200 transition-all duration-300 flex flex-col`}>
        <div className="h-16 flex items-center justify-between px-4 border-b border-gray-200">
          {sidebarOpen && <h1 className="text-lg font-bold text-blue-600">OnBoard Hub</h1>}
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-1 hover:bg-gray-100 rounded">
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        <nav className="flex-1 px-3 py-6 space-y-2">
          {[
            { id: 'dashboard', label: 'Dashboard', icon: Users },
            { id: 'documents', label: 'Document Hub', icon: FileText },
            { id: 'tasks', label: 'Task Management', icon: Zap },
            { id: 'progress', label: 'Progress Tracker', icon: CheckCircle }
          ].map((item) => {
            const Icon = item.icon
            return (
              <button
                key={item.id}
                onClick={() => setCurrentTab(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition ${
                  currentTab === item.id
                    ? 'bg-blue-100 text-blue-600'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                {sidebarOpen && <span className="text-sm font-medium">{item.label}</span>}
              </button>
            )
          })}
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="h-16 bg-white border-b border-gray-200 px-8 flex items-center">
          <h2 className="text-xl font-semibold text-gray-900">Candidate Onboarding Automation</h2>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-8">
          <Tabs value={currentTab} onValueChange={setCurrentTab} className="hidden">
            <TabsList className="hidden" />
          </Tabs>

          {currentTab === 'dashboard' && <Dashboard candidates={candidates} onNewOnboarding={handleNewOnboarding} onInitiate={handleInitiate} />}
          {currentTab === 'documents' && <DocumentHub candidates={candidates} onProcessDocuments={() => {}} />}
          {currentTab === 'tasks' && <TaskManagement candidates={candidates} tasks={tasks} onAddTask={() => {}} onGenerateTasks={handleGenerateTasks} />}
          {currentTab === 'progress' && <ProgressTracker candidates={candidates} />}
        </div>
      </div>
    </div>
  )
}
