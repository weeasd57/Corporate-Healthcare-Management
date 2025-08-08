'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/supabase'
import Layout from '@/components/layout/Layout'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { 
  Building2, 
  Users, 
  Calendar, 
  Phone, 
  Mail, 
  MapPin,
  Eye,
  Edit,
  Search,
  Filter,
  Star,
  CheckCircle,
  AlertCircle,
  Clock
} from 'lucide-react'
import { cn } from '@/lib/utils'

export default function ClientCompaniesPage() {
  const { user, organization, loading } = useAuth()
  const [companies, setCompanies] = useState([])
  const [filteredCompanies, setFilteredCompanies] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [isLoading, setIsLoading] = useState(true)

  // Mock data - في التطبيق الحقيقي، ستأتي من قاعدة البيانات
  const mockCompanies = [
    {
      id: 1,
      name: 'شركة التقنية المتقدمة',
      email: 'info@tech-advanced.com',
      phone: '+966501234567',
      address: 'الرياض، حي الملز',
      contract_status: 'active',
      contract_start: '2024-01-01',
      contract_end: '2024-12-31',
      employees_count: 150,
      last_appointment: '2024-12-15',
      rating: 4.8,
      total_spent: 125000,
      monthly_checkups: 12,
      contact_person: 'أحمد محمد',
      contact_phone: '+966501234567'
    },
    {
      id: 2,
      name: 'مؤسسة البناء الحديث',
      email: 'hr@modern-build.com',
      phone: '+966502345678',
      address: 'جدة، حي الزهراء',
      contract_status: 'pending',
      contract_start: '2024-02-01',
      contract_end: '2025-01-31',
      employees_count: 75,
      last_appointment: '2024-12-10',
      rating: 4.5,
      total_spent: 68000,
      monthly_checkups: 8,
      contact_person: 'فاطمة العلي',
      contact_phone: '+966502345678'
    },
    {
      id: 3,
      name: 'شركة الخدمات المالية',
      email: 'contact@financial-services.com',
      phone: '+966503456789',
      address: 'الدمام، حي الشاطئ',
      contract_status: 'expired',
      contract_start: '2023-01-01',
      contract_end: '2023-12-31',
      employees_count: 200,
      last_appointment: '2024-11-20',
      rating: 4.2,
      total_spent: 180000,
      monthly_checkups: 15,
      contact_person: 'خالد السالم',
      contact_phone: '+966503456789'
    },
    {
      id: 4,
      name: 'مجموعة التجارة الذكية',
      email: 'info@smart-trade.com',
      phone: '+966504567890',
      address: 'الرياض، حي العليا',
      contract_status: 'active',
      contract_start: '2024-03-01',
      contract_end: '2025-02-28',
      employees_count: 120,
      last_appointment: '2024-12-18',
      rating: 4.9,
      total_spent: 95000,
      monthly_checkups: 10,
      contact_person: 'مريم الحربي',
      contact_phone: '+966504567890'
    }
  ]

  useEffect(() => {
    // محاكاة تحميل البيانات
    setTimeout(() => {
      setCompanies(mockCompanies)
      setFilteredCompanies(mockCompanies)
      setIsLoading(false)
    }, 1000)
  }, [])

  useEffect(() => {
    let filtered = companies

    // فلترة بالبحث
    if (searchTerm) {
      filtered = filtered.filter(company => 
        company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        company.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        company.contact_person.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // فلترة بالحالة
    if (statusFilter !== 'all') {
      filtered = filtered.filter(company => company.contract_status === statusFilter)
    }

    setFilteredCompanies(filtered)
  }, [searchTerm, statusFilter, companies])

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />
      case 'expired':
        return <AlertCircle className="h-4 w-4 text-red-500" />
      default:
        return null
    }
  }

  const getStatusText = (status) => {
    switch (status) {
      case 'active':
        return 'نشط'
      case 'pending':
        return 'في الانتظار'
      case 'expired':
        return 'منتهي'
      default:
        return 'غير محدد'
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-green-50 text-green-700 border-green-200'
      case 'pending':
        return 'bg-yellow-50 text-yellow-700 border-yellow-200'
      case 'expired':
        return 'bg-red-50 text-red-700 border-red-200'
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200'
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
              الشركات العميلة
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              إدارة ومتابعة الشركات المتعاقدة مع المستشفى
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Building2 className="h-8 w-8 text-blue-600" />
              </div>
              <div className="mr-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    إجمالي الشركات
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {companies.length}
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
                    العقود النشطة
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {companies.filter(c => c.contract_status === 'active').length}
                  </dd>
                </dl>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Users className="h-8 w-8 text-purple-600" />
              </div>
              <div className="mr-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    إجمالي الموظفين
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {companies.reduce((sum, c) => sum + c.employees_count, 0)}
                  </dd>
                </dl>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Calendar className="h-8 w-8 text-orange-600" />
              </div>
              <div className="mr-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    الفحوصات الشهرية
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {companies.reduce((sum, c) => sum + c.monthly_checkups, 0)}
                  </dd>
                </dl>
              </div>
            </div>
          </Card>
        </div>

        {/* Filters */}
        <Card className="p-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                البحث
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  type="text"
                  placeholder="ابحث بالاسم أو البريد أو جهة الاتصال..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                حالة العقد
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="all">جميع الحالات</option>
                <option value="active">نشط</option>
                <option value="pending">في الانتظار</option>
                <option value="expired">منتهي</option>
              </select>
            </div>

            <div className="flex items-end">
              <Button variant="outline" className="w-full">
                <Filter className="h-4 w-4 ml-2" />
                فلترة متقدمة
              </Button>
            </div>
          </div>
        </Card>

        {/* Companies List */}
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          {isLoading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-500">جاري تحميل البيانات...</p>
            </div>
          ) : filteredCompanies.length === 0 ? (
            <div className="p-8 text-center">
              <Building2 className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">لا توجد شركات</h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchTerm || statusFilter !== 'all' 
                  ? 'لا توجد شركات تطابق معايير البحث المحددة'
                  : 'لم يتم العثور على أي شركات عميلة'}
              </p>
            </div>
          ) : (
            <ul className="divide-y divide-gray-200">
              {filteredCompanies.map((company) => (
                <li key={company.id}>
                  <div className="px-4 py-4 sm:px-6 hover:bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center min-w-0 flex-1">
                        <div className="flex-shrink-0">
                          <Building2 className="h-10 w-10 text-gray-400" />
                        </div>
                        <div className="mr-4 min-w-0 flex-1">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-lg font-medium text-gray-900 truncate">
                                {company.name}
                              </p>
                              <div className="mt-1 flex items-center text-sm text-gray-500">
                                <MapPin className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                                {company.address}
                              </div>
                            </div>
                            <div className="flex items-center">
                              <span className={cn(
                                "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border",
                                getStatusColor(company.contract_status)
                              )}>
                                {getStatusIcon(company.contract_status)}
                                <span className="mr-1">{getStatusText(company.contract_status)}</span>
                              </span>
                            </div>
                          </div>
                          
                          <div className="mt-2 grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm text-gray-500">
                            <div className="flex items-center">
                              <Users className="h-4 w-4 mr-1" />
                              {company.employees_count} موظف
                            </div>
                            <div className="flex items-center">
                              <Phone className="h-4 w-4 mr-1" />
                              {company.phone}
                            </div>
                            <div className="flex items-center">
                              <Star className="h-4 w-4 mr-1 text-yellow-400" />
                              {company.rating}
                            </div>
                            <div className="flex items-center">
                              <Calendar className="h-4 w-4 mr-1" />
                              {company.monthly_checkups} فحص/شهر
                            </div>
                          </div>

                          <div className="mt-2 grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm text-gray-500">
                            <div>
                              <span className="font-medium">جهة الاتصال:</span> {company.contact_person}
                            </div>
                            <div>
                              <span className="font-medium">آخر موعد:</span> {company.last_appointment}
                            </div>
                            <div>
                              <span className="font-medium">إجمالي الإنفاق:</span> {company.total_spent.toLocaleString()} ريال
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="mr-4 flex-shrink-0 flex space-x-2 space-x-reverse">
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4 ml-1" />
                          عرض
                        </Button>
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4 ml-1" />
                          تعديل
                        </Button>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </Layout>
  )
}