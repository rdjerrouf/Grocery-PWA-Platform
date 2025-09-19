import { createServerClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { AdminLayout } from '@/components/admin/AdminLayout'
import { CategoryForm } from '@/components/admin/CategoryForm'

async function updateCategory(formData: FormData) {
  'use server'

  const supabase = createServerClient()
  const categoryId = formData.get('id') as string

  const categoryData = {
    name: formData.get('name') as string,
    name_ar: formData.get('name_ar') as string || null,
    name_fr: formData.get('name_fr') as string || null,
    slug: formData.get('slug') as string,
    description: formData.get('description') as string || null,
    display_order: parseInt(formData.get('display_order') as string) || 0,
    tenant_id: formData.get('tenant_id') as string || null,
    is_active: formData.get('is_active') === 'true'
  }

  const { error } = await supabase
    .from('categories')
    .update(categoryData)
    .eq('id', categoryId)

  if (error) {
    console.error('Error updating category:', error)
    return { success: false, error: error.message }
  }

  revalidatePath('/admin/categories')
  redirect('/admin/categories')
}

async function deleteCategory(formData: FormData) {
  'use server'

  const supabase = createServerClient()
  const categoryId = formData.get('id') as string

  const { error } = await supabase
    .from('categories')
    .delete()
    .eq('id', categoryId)

  if (error) {
    console.error('Error deleting category:', error)
    return { success: false, error: error.message }
  }

  revalidatePath('/admin/categories')
  redirect('/admin/categories')
}

interface CategoryEditPageProps {
  params: {
    id: string
  }
}

export default async function CategoryEditPage({ params }: CategoryEditPageProps) {
  const supabase = createServerClient()

  // Get category details
  const { data: category, error } = await supabase
    .from('categories')
    .select(`
      *,
      tenant:tenants(name, slug),
      products:products(count)
    `)
    .eq('id', params.id)
    .single()

  if (error || !category) {
    redirect('/admin/categories')
  }

  // Get all tenants for the form
  const { data: tenants } = await supabase
    .from('tenants')
    .select('id, name, slug')
    .eq('is_active', true)
    .order('name')

  return (
    <AdminLayout>
      <div className="p-6 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Edit Category</h1>
          <p className="mt-2 text-gray-600">
            Update category details for: <span className="font-medium">{category.name}</span>
          </p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <CategoryForm
            category={category}
            tenants={tenants || []}
            onUpdate={updateCategory}
            onDelete={deleteCategory}
          />
        </div>
      </div>
    </AdminLayout>
  )
}