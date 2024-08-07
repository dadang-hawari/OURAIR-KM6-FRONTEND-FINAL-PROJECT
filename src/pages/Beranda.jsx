import { useLocation, useNavigate } from 'react-router-dom'
import Header from '../components/Beranda/Header'
import Toast from '../components/common/Toast'
import RecommendDestination from '../components/Beranda/RecommmendDestination'
import BackToTop from '../components/common/BackToTop'
import { useEffect } from 'react'
import { checkLocationState } from '../utils/checkLocationState'
import { Bounce, Flip } from 'react-toastify'
import Footer from '../components/common/Footer'

export default function Beranda() {
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    checkLocationState(location, navigate)
  }, [])

  return (
    <div>
      <Header />
      {/* Destinasi Favorit */}
      <RecommendDestination />
      <Toast autoClose={3000} position="bottom-center" transition={Flip} margin="mt-0" />
      <BackToTop />
      <Footer />
    </div>
  )
}
