'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/supabase'
import Layout from '@/components/layout/Layout'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { 
  Package, 
  AlertTriangle, 
  Plus, 
  Search, 
  Filter,
  Eye,
  Edit,
  Trash2,
  ShoppingCart,
  Calendar,
  User,
  FileText,
  ExclamationTriangle,
  CheckCircle,
  XCircle,
  TrendingDown,
  TrendingUp,
  BarChart3,
  Pill
} from 'lucide-react'
import { cn } from '@/lib/utils'

export default function PharmacyPage() {
  const { user, organization, loading } = useAuth()
  const [activeTab, setActiveTab] = useState('inventory') // inventory, prescriptions, interactions
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [isLoading, setIsLoading] = useState(true)

  // Mock data for medicines
  const [medicines, setMedicines] = useState([])
  const [prescriptions, setPrescriptions] = useState([])

  const mockMedicines = [
    {
      id: 1,
      name: 'باراسيتامول 500مج',
      generic_name: 'Paracetamol',
      brand: 'بانادول',
      category: 'مسكنات',
      quantity: 150,
      min_stock: 50,
      max_stock: 500,
      unit_price: 0.5,
      expiry_date: '2025-12-31',
      status: 'available',
      supplier: 'شركة الأدوية المتقدمة',
      storage_location: 'A1-B2',
      notes: 'مسكن وخافض للحرارة'
    },
    {
      id: 2,
      name: 'أموكسيسيلين 250مج',
      generic_name: 'Amoxicillin',
      brand: 'أموكسيل',
      category: 'مضادات حيوية',
      quantity: 25,
      min_stock: 30,
      max_stock: 200,
      unit_price: 2.5,
      expiry_date: '2024-06-30',
      status: 'low_stock',
      supplier: 'مختبرات الشرق الأوسط',
      storage_location: 'B1-C3',
      notes: 'مضاد حيوي واسع المدى'
    },
    {
      id: 3,
      name: 'أسبرين 100مج',
      generic_name: 'Aspirin',
      brand: 'أسبيجيك',
      category: 'مضادات التجلط',
      quantity: 80,
      min_stock: 40,
      max_stock: 300,
      unit_price: 0.3,
      expiry_date: '2025-03-15',
      status: 'available',
      supplier: 'الشركة العالمية للأدوية',
      storage_location: 'C1-A1',
      notes: 'مضاد للتجلط وللالتهاب'
    },
    {
      id: 4,
      name: 'إنسولين',
      generic_name: 'Insulin',
      brand: 'نوفورابيد',
      category: 'هرمونات',
      quantity: 5,
      min_stock: 20,
      max_stock: 100,
      unit_price: 45.0,
      expiry_date: '2024-03-01',
      status: 'critical',
      supplier: 'نوفو نورديسك',
      storage_location: 'COLD-A1',
      notes: 'يحفظ في الثلاجة - منتهي الصلاحية قريباً'
    }
  ]

  const mockPrescriptions = [
    {
      id: 1,
      patient_name: 'أحمد محمد علي',
      doctor_name: 'د. سارة أحمد',
      date: '2024-12-19',
      medicines: [
        { id: 1, name: 'باراسيتامول 500مج', quantity: 20, dosage: 'قرص كل 8 ساعات', duration: '5 أيام' },
        { id: 3, name: 'أسبرين 100مج', quantity: 30, dosage: 'قرص يومياً', duration: '30 يوم' }
      ],
      status: 'pending',
      total_cost: 19.0,
      notes: 'للصداع وارتفاع ضغط الدم'
    },
    {
      id: 2,
      patient_name: 'فاطمة العلي',
      doctor_name: 'د. محمد خالد',
      date: '2024-12-18',
      medicines: [
        { id: 2, name: 'أموكسيسيلين 250مج', quantity: 21, dosage: 'كبسولة كل 8 ساعات', duration: '7 أيام' }
      ],
      status: 'dispensed',
      total_cost: 52.5,
      notes: 'التهاب في الحلق'
    },
    {
      id: 3,
      patient_name: 'خالد السالم',
      doctor_name: 'د. نور حسن',
      date: '2024-12-17',
      medicines: [
        { id: 4, name: 'إنسولين', quantity: 2, dosage: 'حقنة كل 12 ساعة', duration: '30 يوم' }
      ],
      status: 'cancelled',
      total_cost: 90.0,
      notes: 'مريض سكري - ملغية بناء على طلب المريض'
    }
  ]

  useEffect(() => {
    // محاكاة تحميل البيانات
    setTimeout(() => {
      setMedicines(mockMedicines)
      setPrescriptions(mockPrescriptions)
      setIsLoading(false)
    }, 1000)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const getStockStatus = (medicine) => {
    if (medicine.quantity <= 0) return 'out_of_stock'
    if (medicine.quantity <= medicine.min_stock) return 'low_stock'
    if (medicine.quantity >= medicine.max_stock * 0.9) return 'high_stock'
    return 'normal'
  }

  const getStockStatusColor = (status) => {
    switch (status) {
      case 'out_of_stock':
        return 'bg-red-50 text-red-700 border-red-200'
      case 'low_stock':
        return 'bg-yellow-50 text-yellow-700 border-yellow-200'
      case 'high_stock':
        return 'bg-blue-50 text-blue-700 border-blue-200'
      default:
        return 'bg-green-50 text-green-700 border-green-200'
    }
  }

  const getStockStatusText = (status) => {
    switch (status) {
      case 'out_of_stock':
        return 'Out of stock'
      case 'low_stock':
        return 'Low stock'
      case 'high_stock':
        return 'High stock'
      default:
        return 'Available'
    }
  }

  const getPrescriptionStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-50 text-yellow-700 border-yellow-200'
      case 'dispensed':
        return 'bg-green-50 text-green-700 border-green-200'
      case 'cancelled':
        return 'bg-red-50 text-red-700 border-red-200'
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200'
    }
  }

  const getPrescriptionStatusText = (status) => {
    switch (status) {
      case 'pending':
        return 'Pending'
      case 'dispensed':
        return 'Dispensed'
      case 'cancelled':
        return 'Cancelled'
      default:
        return 'Unknown'
    }
  }

  const filteredMedicines = medicines.filter(medicine => {
    const matchesSearch = medicine.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         medicine.generic_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         medicine.brand.toLowerCase().includes(searchTerm.toLowerCase())
    
    if (filterStatus === 'all') return matchesSearch
    if (filterStatus === 'low_stock') return matchesSearch && getStockStatus(medicine) === 'low_stock'
    if (filterStatus === 'out_of_stock') return matchesSearch && getStockStatus(medicine) === 'out_of_stock'
    return matchesSearch
  })

  const filteredPrescriptions = prescriptions.filter(prescription => {
    const matchesSearch = prescription.patient_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         prescription.doctor_name.toLowerCase().includes(searchTerm.toLowerCase())
    
    if (filterStatus === 'all') return matchesSearch
    return matchesSearch && prescription.status === filterStatus
  })

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
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Unauthorized</h1>
          <p className="text-gray-600">This page is available for hospitals only</p>
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
              Pharmacy Management
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Manage medicine inventory and prescriptions
            </p>
          </div>
          <div className="mt-4 flex md:mt-0 md:mr-4 space-x-3 space-x-reverse">
            <Button>
              <Plus className="h-4 w-4 ml-2" />
              Add Medicine
            </Button>
            <Button variant="outline">
              <FileText className="h-4 w-4 ml-2" />
              New Prescription
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 space-x-reverse">
            <button
              onClick={() => setActiveTab('inventory')}
              className={cn(
                'whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm',
                activeTab === 'inventory'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              )}
            >
              <Package className="h-4 w-4 ml-2 inline" />
              Inventory
            </button>
            <button
              onClick={() => setActiveTab('prescriptions')}
              className={cn(
                'whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm',
                activeTab === 'prescriptions'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              )}
            >
              <FileText className="h-4 w-4 ml-2 inline" />
              Prescriptions
            </button>
            <button
              onClick={() => setActiveTab('reports')}
              className={cn(
                'whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm',
                activeTab === 'reports'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              )}
            >
              <BarChart3 className="h-4 w-4 ml-2 inline" />
              Reports
            </button>
          </nav>
        </div>

        {activeTab === 'inventory' && (
          <>
            {/* Inventory Stats */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              <Card className="p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <Package className="h-8 w-8 text-blue-600" />
                  </div>
                  <div className="mr-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Total Medicines
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {medicines.length}
                      </dd>
                    </dl>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <AlertTriangle className="h-8 w-8 text-yellow-600" />
                  </div>
                  <div className="mr-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Low Stock
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {medicines.filter(m => getStockStatus(m) === 'low_stock').length}
                      </dd>
                    </dl>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <XCircle className="h-8 w-8 text-red-600" />
                  </div>
                  <div className="mr-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Out of Stock
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {medicines.filter(m => getStockStatus(m) === 'out_of_stock').length}
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
                        Expiring Soon
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {medicines.filter(m => {
                          const expiryDate = new Date(m.expiry_date)
                          const threeMonthsFromNow = new Date()
                          threeMonthsFromNow.setMonth(threeMonthsFromNow.getMonth() + 3)
                          return expiryDate <= threeMonthsFromNow
                        }).length}
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
                    Search
                  </label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      type="text"
                      placeholder="Search by name or active ingredient..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Stock Status
                  </label>
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  >
                    <option value="all">All Statuses</option>
                    <option value="low_stock">Low Stock</option>
                    <option value="out_of_stock">Out of Stock</option>
                  </select>
                </div>

                <div className="flex items-end">
                  <Button variant="outline" className="w-full">
                    <Filter className="h-4 w-4 ml-2" />
                    Advanced Filter
                  </Button>
                </div>
              </div>
            </Card>

            {/* Medicines List */}
            <div className="bg-white shadow overflow-hidden sm:rounded-md">
              {isLoading ? (
                <div className="p-8 text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-4 text-gray-500">Loading medicines...</p>
                </div>
                           ) : filteredMedicines.length === 0 ? (
               <div className="p-8 text-center">
                 <Pill className="mx-auto h-12 w-12 text-gray-400" />
                 <h3 className="mt-2 text-sm font-medium text-gray-900">No Medicines Found</h3>
                 <p className="mt-1 text-sm text-gray-500">No medicines match your search criteria</p>
               </div>
              ) : (
                <ul className="divide-y divide-gray-200">
                  {filteredMedicines.map((medicine) => (
                    <li key={medicine.id}>
                      <div className="px-4 py-4 sm:px-6 hover:bg-gray-50">
                        <div className="flex items-center justify-between">
                                                     <div className="flex items-center min-w-0 flex-1">
                             <div className="flex-shrink-0">
                               <Pill className="h-10 w-10 text-blue-500" />
                             </div>
                            <div className="mr-4 min-w-0 flex-1">
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="text-lg font-medium text-gray-900 truncate">
                                    {medicine.name}
                                  </p>
                                  <p className="text-sm text-gray-600">
                                    {medicine.generic_name} - {medicine.brand}
                                  </p>
                                </div>
                                <div className="flex items-center space-x-2 space-x-reverse">
                                  <span className={cn(
                                    "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border",
                                    getStockStatusColor(getStockStatus(medicine))
                                  )}>
                                    {getStockStatusText(getStockStatus(medicine))}
                                  </span>
                                  <span className="text-sm text-gray-500">
                                    {medicine.category}
                                  </span>
                                </div>
                              </div>

                              <div className="mt-2 grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm text-gray-500">
                                <div>
                                  <span className="font-medium">Quantity:</span> {medicine.quantity}
                                </div>
                                <div>
                                  <span className="font-medium">Price:</span> {medicine.unit_price} SAR
                                </div>
                                <div>
                                  <span className="font-medium">Expiry Date:</span> {medicine.expiry_date}
                                </div>
                                <div>
                                  <span className="font-medium">Location:</span> {medicine.storage_location}
                                </div>
                              </div>

                              {medicine.notes && (
                                <div className="mt-2 text-sm text-gray-600">
                                  <span className="font-medium">Notes:</span> {medicine.notes}
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="mr-4 flex-shrink-0 flex space-x-2 space-x-reverse">
                            <Button variant="outline" size="sm">
                              <Eye className="h-4 w-4 ml-1" />
                              View
                            </Button>
                            <Button variant="outline" size="sm">
                              <Edit className="h-4 w-4 ml-1" />
                              Edit
                            </Button>
                            <Button variant="outline" size="sm">
                              <ShoppingCart className="h-4 w-4 ml-1" />
                              Order
                            </Button>
                          </div>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </>
        )}

        {activeTab === 'prescriptions' && (
          <>
            {/* Prescription Stats */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
              <Card className="p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <FileText className="h-8 w-8 text-blue-600" />
                  </div>
                  <div className="mr-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Total Prescriptions
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {prescriptions.length}
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
                        Dispensed
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {prescriptions.filter(p => p.status === 'dispensed').length}
                      </dd>
                    </dl>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <AlertTriangle className="h-8 w-8 text-yellow-600" />
                  </div>
                  <div className="mr-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Pending
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {prescriptions.filter(p => p.status === 'pending').length}
                      </dd>
                    </dl>
                  </div>
                </div>
              </Card>
            </div>

            {/* Prescriptions List */}
            <div className="bg-white shadow overflow-hidden sm:rounded-md">
              {isLoading ? (
                <div className="p-8 text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-4 text-gray-500">Loading prescriptions...</p>
                </div>
              ) : filteredPrescriptions.length === 0 ? (
                <div className="p-8 text-center">
                  <FileText className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No Prescriptions Found</h3>
                  <p className="mt-1 text-sm text-gray-500">No prescriptions match your search criteria</p>
                </div>
              ) : (
                <ul className="divide-y divide-gray-200">
                  {filteredPrescriptions.map((prescription) => (
                    <li key={prescription.id}>
                      <div className="px-4 py-4 sm:px-6 hover:bg-gray-50">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center min-w-0 flex-1">
                            <div className="flex-shrink-0">
                              <FileText className="h-10 w-10 text-green-500" />
                            </div>
                            <div className="mr-4 min-w-0 flex-1">
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="text-lg font-medium text-gray-900">
                                    Prescription #{prescription.id}
                                  </p>
                                  <div className="flex items-center mt-1">
                                    <User className="h-4 w-4 ml-1 text-gray-400" />
                                    <span className="text-sm text-gray-600">
                                      {prescription.patient_name}
                                    </span>
                                  </div>
                                </div>
                                <div className="text-left">
                                  <span className={cn(
                                    "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border",
                                    getPrescriptionStatusColor(prescription.status)
                                  )}>
                                    {getPrescriptionStatusText(prescription.status)}
                                  </span>
                                  <p className="text-sm text-gray-500 mt-1">
                                    {prescription.date}
                                  </p>
                                </div>
                              </div>

                              <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-gray-500">
                                <div>
                                  <span className="font-medium">Doctor:</span> {prescription.doctor_name}
                                </div>
                                <div>
                                  <span className="font-medium">Total Cost:</span> {prescription.total_cost} SAR
                                </div>
                              </div>

                              <div className="mt-3">
                                <p className="text-sm font-medium text-gray-700 mb-2">Required Medicines:</p>
                                <div className="space-y-1">
                                  {prescription.medicines.map((med, index) => (
                                    <div key={index} className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                                      <span className="font-medium">{med.name}</span> - 
                                      كمية: {med.quantity} - 
                                      الجرعة: {med.dosage} - 
                                      المدة: {med.duration}
                                    </div>
                                  ))}
                                </div>
                              </div>

                              {prescription.notes && (
                                <div className="mt-2 text-sm text-gray-600">
                                  <span className="font-medium">Notes:</span> {prescription.notes}
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="mr-4 flex-shrink-0 flex flex-col space-y-2">
                                                         {prescription.status === 'pending' && (
                               <Button size="sm" className="bg-green-600 hover:bg-green-700">
                                 <Pill className="h-4 w-4 ml-1" />
                                 Dispense Medicines
                               </Button>
                             )}
                            <div className="flex space-x-2 space-x-reverse">
                              <Button variant="outline" size="sm">
                                <Eye className="h-4 w-4 ml-1" />
                                View
                              </Button>
                              <Button variant="outline" size="sm">
                                <Edit className="h-4 w-4 ml-1" />
                                Edit
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </>
        )}

        {activeTab === 'reports' && (
          <div className="text-center py-12">
            <BarChart3 className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Reports Under Development</h3>
            <p className="mt-1 text-sm text-gray-500">
              Detailed reports on medicine consumption and sales will be available soon
            </p>
          </div>
        )}
      </div>
    </Layout>
  )
}