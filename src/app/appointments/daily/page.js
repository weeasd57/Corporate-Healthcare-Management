'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/supabase'
import Layout from '@/components/layout/Layout'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { 
  Calendar, 
  Clock, 
  User, 
  Building2, 
  Check, 
  X, 
  Phone,
  FileText,
  AlertCircle,
  CheckCircle,
  XCircle,
  Eye,
  Edit,
  RefreshCw,
  Filter,
  Search,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'
import { cn } from '@/lib/utils'

export default function DailyAppointmentsPage() {
  const { user, organization, loading } = useAuth()
  const [appointments, setAppointments] = useState([])
  const [filteredAppointments, setFilteredAppointments] = useState([])
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [statusFilter, setStatusFilter] = useState('all')
  const [isLoading, setIsLoading] = useState(true)

  // Mock data - في التطبيق الحقيقي، ستأتي من قاعدة البيانات
  const mockAppointments = [
    {
      id: 1,
      time: '08:00',
      patient_name: 'أحمد محمد علي',
      company_name: 'شركة التقنية المتقدمة',
      employee_id: 'EMP001',
      appointment_type: 'فحص دوري',
      status: 'confirmed',
      doctor: 'د. سارة أحمد',
      department: 'الطب العام',
      phone: '+966501234567',
      notes: 'فحص سنوي شامل',
      duration: 30
    },
    {
      id: 2,
      time: '08:30',
      patient_name: 'فاطمة العلي',
      company_name: 'مؤسسة البناء الحديث',
      employee_id: 'EMP002',
      appointment_type: 'فحص طارئ',
      status: 'pending',
      doctor: 'د. محمد خالد',
      department: 'الطوارئ',
      phone: '+966502345678',
      notes: 'شكوى من آلام في الصدر',
      duration: 45
    },
    {
      id: 3,
      time: '09:00',
      patient_name: 'خالد السالم',
      company_name: 'شركة الخدمات المالية',
      employee_id: 'EMP003',
      appointment_type: 'متابعة',
      status: 'completed',
      doctor: 'د. نور حسن',
      department: 'القلب والأوعية',
      phone: '+966503456789',
      notes: 'متابعة ضغط الدم',
      duration: 20
    },
    {
      id: 4,
      time: '09:30',
      patient_name: 'مريم الحربي',
      company_name: 'مجموعة التجارة الذكية',
      employee_id: 'EMP004',
      appointment_type: 'فحص دوري',
      status: 'cancelled',
      doctor: 'د. عبدالله أحمد',
      department: 'النساء والولادة',
      phone: '+966504567890',
      notes: 'إلغاء بناء على طلب المريضة',
      duration: 30
    },
    {
      id: 5,
      time: '10:00',
      patient_name: 'سعد المطيري',
      company_name: 'شركة التقنية المتقدمة',
      employee_id: 'EMP005',
      appointment_type: 'فحص تخصصي',
      status: 'confirmed',
      doctor: 'د. ليلى سالم',
      department: 'العظام',
      phone: '+966505678901',
      notes: 'فحص إصابة في الركبة',
      duration: 60
    },
    {
      id: 6,
      time: '11:00',
      patient_name: 'نور عبدالرحمن',
      company_name: 'مؤسسة البناء الحديث',
      employee_id: 'EMP006',
      appointment_type: 'فحص دوري',
      status: 'pending',
      doctor: 'د. أحمد يوسف',
      department: 'الجلدية',
      phone: '+966506789012',
      notes: 'فحص الجلد السنوي',
      duration: 25
    }
  ]

  useEffect(() => {
    // محاكاة تحميل البيانات
    setTimeout(() => {
      setAppointments(mockAppointments)
      setFilteredAppointments(mockAppointments)
      setIsLoading(false)
    }, 1000)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDate])

  useEffect(() => {
    let filtered = appointments

    // فلترة بالحالة
    if (statusFilter !== 'all') {
      filtered = filtered.filter(appointment => appointment.status === statusFilter)
    }

    setFilteredAppointments(filtered)
  }, [statusFilter, appointments])

  const getStatusIcon = (status) => {
    switch (status) {
      case 'confirmed':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />
      case 'completed':
        return <Check className="h-4 w-4 text-blue-500" />
      case 'cancelled':
        return <XCircle className="h-4 w-4 text-red-500" />
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusText = (status) => {
    switch (status) {
      case 'confirmed':
        return 'مؤكد'
      case 'pending':
        return 'في الانتظار'
      case 'completed':
        return 'مكتمل'
      case 'cancelled':
        return 'ملغي'
      default:
        return 'غير محدد'
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-50 text-green-700 border-green-200'
      case 'pending':
        return 'bg-yellow-50 text-yellow-700 border-yellow-200'
      case 'completed':
        return 'bg-blue-50 text-blue-700 border-blue-200'
      case 'cancelled':
        return 'bg-red-50 text-red-700 border-red-200'
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200'
    }
  }

  const handleStatusChange = (appointmentId, newStatus) => {
    setAppointments(prev => 
      prev.map(apt => 
        apt.id === appointmentId 
          ? { ...apt, status: newStatus }
          : apt
      )
    )
  }

  const changeDate = (direction) => {
    const currentDate = new Date(selectedDate)
    if (direction === 'prev') {
      currentDate.setDate(currentDate.getDate() - 1)
    } else {
      currentDate.setDate(currentDate.getDate() + 1)
    }
    setSelectedDate(currentDate.toISOString().split('T')[0])
  }

  const getDateDisplay = () => {
    const date = new Date(selectedDate)
    const today = new Date()
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    if (date.toDateString() === today.toDateString()) {
      return 'اليوم'
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return 'غداً'
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'أمس'
    } else {
      return date.toLocaleDateString('ar-SA', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    }
  }

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (organization?.type !== 'hospital') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">غير مصرح</h1>
          <p className="text-gray-600">هذه الصفحة متاحة للمستشفيات فقط</p>
        </div>
      </div>
    )
  }

  return (
    <Layout user={user} organization={organization}>
      <div className="space-y-6">
        {/* Header */}
        <div className="md:flex md:items-center md:justify-between">
          <div className="flex-1 min-w-0">
            <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
              المواعيد اليومية
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              إدارة ومتابعة مواعيد المرضى اليومية
            </p>
          </div>
          <div className="mt-4 flex md:mt-0 md:mr-4">
            <Button>
              <RefreshCw className="h-4 w-4 ml-2" />
              تحديث
            </Button>
          </div>
        </div>

        {/* Date Navigation */}
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4 space-x-reverse">
              <Button
                variant="outline"
                size="sm"
                onClick={() => changeDate('prev')}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
              
              <div className="flex items-center space-x-3 space-x-reverse">
                <Calendar className="h-5 w-5 text-gray-400" />
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {getDateDisplay()}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {new Date(selectedDate).toLocaleDateString('ar-SA')}
                  </p>
                </div>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => changeDate('next')}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex items-center space-x-4 space-x-reverse">
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
              
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="all">جميع الحالات</option>
                <option value="confirmed">مؤكد</option>
                <option value="pending">في الانتظار</option>
                <option value="completed">مكتمل</option>
                <option value="cancelled">ملغي</option>
              </select>
            </div>
          </div>
        </Card>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Calendar className="h-8 w-8 text-blue-600" />
              </div>
              <div className="mr-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    إجمالي المواعيد
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {appointments.length}
                  </dd>
                </dl>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <div className="mr-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    مؤكدة
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {appointments.filter(a => a.status === 'confirmed').length}
                  </dd>
                </dl>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Clock className="h-8 w-8 text-yellow-600" />
              </div>
              <div className="mr-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    في الانتظار
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {appointments.filter(a => a.status === 'pending').length}
                  </dd>
                </dl>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Check className="h-8 w-8 text-blue-600" />
              </div>
              <div className="mr-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    مكتملة
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {appointments.filter(a => a.status === 'completed').length}
                  </dd>
                </dl>
              </div>
            </div>
          </Card>
        </div>

        {/* Appointments List */}
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          {isLoading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-500">جاري تحميل المواعيد...</p>
            </div>
          ) : filteredAppointments.length === 0 ? (
            <div className="p-8 text-center">
              <Calendar className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">لا توجد مواعيد</h3>
              <p className="mt-1 text-sm text-gray-500">
                {statusFilter !== 'all' 
                  ? 'لا توجد مواعيد تطابق الفلتر المحدد'
                  : 'لا توجد مواعيد في هذا التاريخ'}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredAppointments
                .sort((a, b) => a.time.localeCompare(b.time))
                .map((appointment) => (
                <div key={appointment.id} className="p-6 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center min-w-0 flex-1">
                      <div className="flex-shrink-0">
                        <div className="h-12 w-12 rounded-lg bg-blue-100 flex items-center justify-center">
                          <Clock className="h-6 w-6 text-blue-600" />
                        </div>
                      </div>
                      
                      <div className="mr-4 min-w-0 flex-1">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="flex items-center">
                              <p className="text-lg font-semibold text-gray-900">
                                {appointment.time}
                              </p>
                              <span className={cn(
                                "mr-3 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border",
                                getStatusColor(appointment.status)
                              )}>
                                {getStatusIcon(appointment.status)}
                                <span className="mr-1">{getStatusText(appointment.status)}</span>
                              </span>
                            </div>
                            <p className="text-sm text-gray-600 mt-1">
                              مدة الموعد: {appointment.duration} دقيقة
                            </p>
                          </div>
                        </div>

                        <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                          <div>
                            <div className="flex items-center text-sm text-gray-900">
                              <User className="h-4 w-4 ml-1 text-gray-400" />
                              <span className="font-medium">المريض:</span>
                              <span className="mr-1">{appointment.patient_name}</span>
                            </div>
                            <div className="flex items-center text-sm text-gray-600 mt-1">
                              <Building2 className="h-4 w-4 ml-1 text-gray-400" />
                              {appointment.company_name}
                            </div>
                          </div>

                          <div>
                            <div className="text-sm text-gray-900">
                              <span className="font-medium">نوع الفحص:</span> {appointment.appointment_type}
                            </div>
                            <div className="text-sm text-gray-600 mt-1">
                              <span className="font-medium">القسم:</span> {appointment.department}
                            </div>
                          </div>

                          <div>
                            <div className="text-sm text-gray-900">
                              <span className="font-medium">الطبيب:</span> {appointment.doctor}
                            </div>
                            <div className="flex items-center text-sm text-gray-600 mt-1">
                              <Phone className="h-4 w-4 ml-1 text-gray-400" />
                              {appointment.phone}
                            </div>
                          </div>
                        </div>

                        {appointment.notes && (
                          <div className="mt-3 p-3 bg-gray-50 rounded-md">
                            <div className="flex items-start">
                              <FileText className="h-4 w-4 ml-1 text-gray-400 mt-0.5" />
                              <p className="text-sm text-gray-700">
                                <span className="font-medium">ملاحظات:</span> {appointment.notes}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="mr-4 flex-shrink-0">
                      <div className="flex flex-col space-y-2">
                        {appointment.status === 'pending' && (
                          <div className="flex space-x-2 space-x-reverse">
                            <Button
                              size="sm"
                              onClick={() => handleStatusChange(appointment.id, 'confirmed')}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              <Check className="h-4 w-4 ml-1" />
                              تأكيد
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleStatusChange(appointment.id, 'cancelled')}
                              className="text-red-600 border-red-300 hover:bg-red-50"
                            >
                              <X className="h-4 w-4 ml-1" />
                              إلغاء
                            </Button>
                          </div>
                        )}
                        
                        {appointment.status === 'confirmed' && (
                          <Button
                            size="sm"
                            onClick={() => handleStatusChange(appointment.id, 'completed')}
                            className="bg-blue-600 hover:bg-blue-700"
                          >
                            <Check className="h-4 w-4 ml-1" />
                            إكمال
                          </Button>
                        )}

                        <div className="flex space-x-2 space-x-reverse">
                          <Button size="sm" variant="outline">
                            <Eye className="h-4 w-4 ml-1" />
                            عرض
                          </Button>
                          <Button size="sm" variant="outline">
                            <Edit className="h-4 w-4 ml-1" />
                            تعديل
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  )
}