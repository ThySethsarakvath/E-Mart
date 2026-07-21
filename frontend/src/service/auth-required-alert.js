import Swal from 'sweetalert2'
import 'sweetalert2/dist/sweetalert2.min.css'
import '@/assets/auth-required-alert.css'

let activeDialog = null

export const getAuthenticatedUser = () => {
  if (!localStorage.getItem('accessToken')) return null

  try {
    const user = JSON.parse(localStorage.getItem('user'))
    return user?.id ? user : null
  } catch (error) {
    console.warn('Unable to read the authenticated user:', error)
    return null
  }
}

export const requireAuthenticatedUser = (destination) => {
  if (getAuthenticatedUser()) return true

  if (!activeDialog) {
    const destinationLabel = destination === 'wishlist' ? 'your wishlist' : 'your cart'

    activeDialog = Swal.fire({
      icon: 'info',
      title: 'Sign in to continue',
      text: `Please sign in before adding products to ${destinationLabel}. This keeps your saved products private to your account.`,
      confirmButtonText: 'Sign in',
      cancelButtonText: 'Continue browsing',
      confirmButtonColor: '#0d6efd',
      cancelButtonColor: '#ffffff',
      showCancelButton: true,
      reverseButtons: true,
      buttonsStyling: true,
      heightAuto: false,
      customClass: {
        popup: 'emart-auth-dialog',
        title: 'emart-auth-dialog__title',
        htmlContainer: 'emart-auth-dialog__copy',
        confirmButton: 'emart-auth-dialog__confirm',
        cancelButton: 'emart-auth-dialog__cancel',
      },
    })
      .then((result) => {
        if (result.isConfirmed) {
          const basePath = import.meta.env.BASE_URL.replace(/\/$/, '')
          window.location.assign(`${basePath}/login`)
        }
      })
      .finally(() => {
        activeDialog = null
      })
  }

  return false
}
