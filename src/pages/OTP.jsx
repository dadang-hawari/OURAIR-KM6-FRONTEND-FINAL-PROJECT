import { useEffect, useState } from 'react'
import OTPInput from 'react-otp-input'
import ButtonPrimary from '../components/Login/ButtonPrimary'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { decrementTimerOtp, resetTimerOtp, setOtpSentTime } from '../redux/reducers/otpReducers'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faChevronLeft } from '@fortawesome/free-solid-svg-icons'
import Toast from '../components/common/Toast'
import { Bounce, toast } from 'react-toastify'

import { checkLocationState } from '../utils/checkLocationState'
import { sendVerifyOtp, verifyOTP } from '../redux/actions/authAction'

export default function OTP() {
  const dispatch = useDispatch()
  const email = useSelector((state) => state?.otp?.email)
  const timer = useSelector((state) => state?.otp?.timerOtp)
  const otpSentTime = useSelector((state) => state?.otp?.otpSentTime)
  const location = useLocation()
  const navigate = useNavigate()
  const [otp, setOtp] = useState('')
  const [isTimerActive, setIsTimerActive] = useState(timer > 0)
  const [isLoading, setIsLoading] = useState(false)

  const checkEmail = () => {
    if (!email) navigate('/login')
  }

  // Memulai timer pengiriman ulang OTP
  const startTimer = () => {
    setIsTimerActive(true)
    const now = new Date().toISOString()
    dispatch(setOtpSentTime(now))
    dispatch(resetTimerOtp(150))
  }

  // Memperbarui timer pengiriman ulang OTP
  const updateTimer = () => {
    if (timer <= 1) {
      setIsTimerActive(false)
      dispatch(resetTimerOtp(150))
    } else {
      dispatch(decrementTimerOtp())
    }
  }

  const setTimer = () => {
    const sentTime = new Date(otpSentTime)
    const currentTime = new Date()
    const timeDiff = Math.floor((currentTime - sentTime) / 1000)

    if (timeDiff < 150) {
      dispatch(resetTimerOtp(150 - timeDiff))
      setIsTimerActive(true)
    } else {
      dispatch(resetTimerOtp(0))
      setIsTimerActive(false)
    }
  }

  useEffect(() => {
    checkLocationState(location, navigate)
    checkEmail()
    setTimer()
  }, [dispatch, location, navigate, otpSentTime])

  useEffect(() => {
    if (isTimerActive) {
      const intervalId = setInterval(updateTimer, 1000)
      return () => clearInterval(intervalId)
    }
  }, [isTimerActive, timer])

  // Kirim ulang OTP
  const handleResendOTP = () => {
    startTimer()
    dispatch(sendVerifyOtp(email))
  }

  // Handle OTP
  const handleSubmit = () => {
    if (otp.length < 6) {
      toast('Mohon untuk mengisi seluruh OTP', {
        className: 'toast-error',
        toastId: 'toastError',
      })
      return
    }
    setIsLoading(true)
    dispatch(verifyOTP(email, otp, navigate)).then(() => {
      setIsLoading(false)
    })
  }

  return (
    <div className="mx-auto mt-28 md:mt-4 p-5">
      <div className="max-w-md mx-auto text-center relative">
        <Link
          to="/login"
          className="absolute -top-12 left-0 md:-left-12 p-2 text-accent flex items-center gap-2"
        >
          <FontAwesomeIcon icon={faChevronLeft} className="w-2 h-auto " />
          <p className="text-base  font-medium">Kembali</p>
        </Link>

        <h2 className="text-2xl font-bold mt-10">Masukkan OTP</h2>

        <div className="otp grid gap-4 mt-10 justify-items-center w-full text-sm">
          <p className="mb-5 tracking-wide leading-5">
            Ketik 6 digit kode yang telah dikirimkan ke email <b>{email}</b>
          </p>
          <OTPInput
            value={otp}
            onChange={setOtp}
            numInputs={6}
            inputType="number"
            renderInput={(props) => <input {...props} />}
          />
          <div className="mt-6 mb-20 font-medium">
            {isTimerActive ? (
              <p className="text-gray-600 cursor-default">Kirim Ulang OTP dalam {timer} detik</p>
            ) : (
              <button onClick={handleResendOTP} className="text-red-600">
                Kirim Ulang OTP
              </button>
            )}
          </div>

          <ButtonPrimary onClick={handleSubmit} isDisabled={isLoading} text="Simpan" />
        </div>
        <Toast autoClose={4000} transition={Bounce} />
      </div>
    </div>
  )
}
