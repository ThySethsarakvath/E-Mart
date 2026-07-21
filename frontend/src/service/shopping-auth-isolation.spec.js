import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('sweetalert2', () => ({
  default: {
    fire: vi.fn(() => Promise.resolve({ isConfirmed: false })),
  },
}))

import cartService from './cart'
import wishlistService from './wishlist'

const product = {
  id: 'product-1',
  name: 'Test product',
  price: 12.5,
  imagePath: '/product.png',
}

const authenticateAs = (id) => {
  localStorage.setItem('accessToken', `token-${id}`)
  localStorage.setItem('user', JSON.stringify({ id, email: `${id}@example.com` }))
  cartService.reloadCart()
  wishlistService.reloadWishlist()
}

describe('authenticated shopping storage', () => {
  beforeEach(() => {
    localStorage.clear()
    cartService.reloadCart()
    wishlistService.reloadWishlist()
  })

  it('rejects guest cart and wishlist mutations', () => {
    expect(cartService.addToCart(product)).toBe(false)
    expect(wishlistService.toggleWishlist(product)).toBeNull()

    expect(cartService.state.items).toEqual([])
    expect(wishlistService.state.items).toEqual([])
    expect(localStorage.getItem('cart_items_guest')).toBeNull()
    expect(localStorage.getItem('wishlist_items_guest')).toBeNull()
  })

  it('keeps cart and wishlist data isolated between accounts', () => {
    authenticateAs('account-a')
    cartService.addToCart(product)
    wishlistService.addToWishlist(product)

    authenticateAs('account-b')
    expect(cartService.state.items).toEqual([])
    expect(wishlistService.state.items).toEqual([])

    cartService.addToCart({ ...product, id: 'product-2' })
    wishlistService.addToWishlist({ ...product, id: 'product-2' })

    authenticateAs('account-a')
    expect(cartService.state.items.map((item) => item.id)).toEqual(['product-1'])
    expect(wishlistService.state.items.map((item) => item.id)).toEqual(['product-1'])

    authenticateAs('account-b')
    expect(cartService.state.items.map((item) => item.id)).toEqual(['product-2'])
    expect(wishlistService.state.items.map((item) => item.id)).toEqual(['product-2'])
  })
})
