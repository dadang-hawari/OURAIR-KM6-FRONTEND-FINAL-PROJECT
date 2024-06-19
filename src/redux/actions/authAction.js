import axios from 'axios'
import { toast } from 'react-toastify'
import { setEmail } from '../reducers/otpReducers'
import {
  setIsLoggedIn,
  setToken,
  setUserData,
  logout as logoutAction,
} from '../reducers/authReducer'

const loadingMessage = 'Mohon tunggu sebentar..'
const toastIdWait = 'toasWait'

export const registUser = (phone_number, name, email, password, navigate) => async (dispatch) => {
  try {
    toast.loading(loadingMessage, {
      toastId: toastIdWait,
    })
    const response = await axios.post(`${import.meta.env.VITE_DOMAIN}/api/v1/auth/signup`, {
      phone_number,
      name,
      email,
      password,
    })

    // toast.dismiss("toastLoading");
    if (response?.status === 201) {
      toast.dismiss(toastIdWait)
      dispatch(setEmail(email))
      navigate('/otp', {
        state: { success: `Kode OTP dikirimkan ke email ${email}` },
      })
    }
    console.log('response :>> ', response)
  } catch (error) {
    toast.dismiss(toastIdWait)
    console.log(error)
    if (error?.response?.status === 409) toast.info('Akun ini sudah terdatar')
    else if (error?.response?.data?.errors[0])
      error?.response?.data?.errors[0]?.msg ===
      'Phone number must be between 10 and 15 characters long'
        ? toast('Panjang nomor hp harus antara 10 hingga 15 karakter', {
            className: 'toast-error',
          })
        : toast(error?.response?.data.errors[0].msg, {
            className: 'toast-error',
          })
    else
      toast('Coba lagi nanti, saat ini ada kesalahan di sistem kami', {
        className: 'toast-error',
      })
  }
}
export const verifyOTP = (email, otp, navigate) => async (dispatch) => {
  try {
    toast.loading(loadingMessage, {
      toastId: toastIdWait,
    })

    const response = await axios.post(
      `${import.meta.env.VITE_DOMAIN}/api/v1/auth/verify-email-token`,
      {
        email,
        otp,
      }
    )

    console.log('response :>> ', response)
    if (response?.status === 200 || response?.status === 201) {
      toast.dismiss(toastIdWait),
        navigate('/login', { state: { success: 'Akun berhasil diverifikasi' } })
      dispatch(setEmail(null))
    }
  } catch (error) {
    console.log(error)
    toast.dismiss(toastIdWait)
    if (error?.response?.status === 401) {
      error?.response?.data?.message === 'Invalid or expired OTP'
        ? toast('Kode OTP invalid atau expired', {
            className: 'toast-error',
            toastId: 'toast-error',
          })
        : toast(error?.response?.data?.message, {
            className: 'toast-error',
            toastId: 'toast-error',
          })
    } else
      toast('Coba lagi nanti, saat ini ada kesalahan di sistem kami', {
        className: 'toast-error',
        toastId: 'toast-error',
      })
  }
}
export const sendVerifyOtp = (email) => async () => {
  try {
    toast.loading(loadingMessage, {
      toastId: toastIdWait,
    })
    console.log('email :>> ', email)
    const response = await axios.post(`${import.meta.env.VITE_DOMAIN}/api/v1/auth/try-send-email`, {
      email,
    })

    console.log('response :>> ', response)
    if (response?.status === 201) {
      toast.dismiss(toastIdWait)
      toast('Kode OTP baru berhasil dikirim', { className: 'success-toast' })
    }
  } catch (error) {
    toast.dismiss(toastIdWait)
    toast('Coba lagi nanti, saat ini ada kesalahan di sistem kami', {
      className: 'toast-error',
      toastId: 'toast-error',
    })
  }
}

export const resetPassword = (token, password, navigate) => async () => {
  try {
    const response = await axios.post(
      `${import.meta.env.VITE_DOMAIN}/api/v1/auth/reset-password-do-login`,
      {
        password,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    )
    console.log('response :>> ', response)
    if (response?.status === 200) {
      toast.dismiss('toastLoading')
      navigate('/login', {
        state: {
          success: 'Password berhasil diubah',
        },
      })
    }
  } catch (error) {
    toast.dismiss('toastLoading')

    error?.response?.data?.errors[0]?.msg
      ? toast(error?.response?.data.errors[0].msg, { className: 'toast-error' })
      : toast('Coba lagi nanti, saat ini ada kesalahan di sistem kami', {
          className: 'toast-error',
        })
    console.error('Error:', error)
  }
}

export const authGoogleUser = (token, navigate) => async (dispatch) => {
  try {
    const response = await axios.get(`${import.meta.env.VITE_DOMAIN}/api/v1/auth/who-am-i`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    console.log('import.meta.env.VITE_DOMAIN :>> ', import.meta.env.VITE_DOMAIN)
    console.log('response :>> ', response)
    const data = response?.data.data
    if (response?.status === 200) {
      dispatch(setUserData(data))
      dispatch(setToken(token))
      dispatch(setIsLoggedIn(true))
      navigate('/', {
        state: {
          success: 'Berhasil masuk',
        },
      })
    }
  } catch (error) {
    console.log(error)
    error?.response?.data?.errors[0]?.msg
      ? toast(error?.response?.data.errors[0].msg, { className: 'toast-error' })
      : toast('Coba lagi nanti, saat ini ada kesalahan di sistem kami', {
          className: 'toast-error',
        })
    console.error('Error:', error)
  }
}

export const forgotPassword = (email) => async () => {
  try {
    toast.loading(loadingMessage, {
      toastId: toastIdWait,
    })

    const response = await axios.post(
      `${import.meta.env.VITE_DOMAIN}/api/v1/auth/forgot-password-send-email`,
      {
        email,
      }
    )
    console.log('response :>> ', response)
    if (response?.status === 201) {
      toast.dismiss(toastIdWait)
      toast(`Link reset password telah dikirimkan ke email ${email}`, {
        className: 'success-toast',
      })
    }
  } catch (error) {
    toast.dismiss(toastIdWait)
    if (error?.response?.status === 404) toast.info('Akun ini belum terdatar')
    else
      error?.response?.data?.errors[0]?.msg
        ? toast(error?.response?.data.errors[0].msg, { className: 'toast-error' })
        : toast('Coba lagi nanti, saat ini ada kesalahan di sistem kami', {
            className: 'toast-error',
          })
    console.error('Error:', error)
  }
}

export const loginUser = (email, password, navigate) => async (dispatch) => {
  try {
    toast.loading(loadingMessage, {
      toastId: toastIdWait,
    })
    const response = await axios.post(`${import.meta.env.VITE_DOMAIN}/api/v1/auth/signin`, {
      email,
      password,
    })
    const data = response?.data.data
    console.log('response login :>> ', response)
    if (response?.data.message === 'success') {
      toast.dismiss(toastIdWait)
      dispatch(setToken(data.token))
      dispatch(setUserData(data))
      dispatch(setIsLoggedIn(true))
      navigate('/', {
        state: {
          success: 'Berhasil Masuk',
        },
      })
    }
  } catch (error) {
    toast.dismiss(toastIdWait)
    if (error?.response?.status === 409)
      toast('Email atau Password yang Anda masukkan Salah', {
        className: 'toast-error',
      })
    else if (error?.response?.status === 404) toast.info('Akun belum terdaftar')
    else
      error?.response?.data?.errors[0]?.msg
        ? toast(error?.response?.data.errors[0].msg, { className: 'toast-error' })
        : toast('Coba lagi nanti, saat ini ada kesalahan di sistem kami', {
            className: 'toast-error',
          })

    console.log(error)
  }
}

export const logout = () => async (dispatch) => {
  dispatch(logoutAction())
}
