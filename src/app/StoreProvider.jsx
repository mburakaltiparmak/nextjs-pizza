'use client'
import { useRef } from 'react'
import { Provider } from 'react-redux'
import { store } from '@/lib/store/store'


export default function StoreProvider({ children }) {
  

  return <Provider store={store}>{children}</Provider>
}