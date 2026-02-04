import React, { useState } from 'react'
import { Lock, Eye, EyeOff, CheckCircle, XCircle } from 'lucide-react'
import changePassword from '../../shared/api/changePassword'
import Spinner from '../../shared/components/Spinner'

export default function ChangePasswordPage() {
  const [formData, setFormData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [showPasswords, setShowPasswords] = useState({
    old: false,
    new: false,
    confirm: false
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    // Clear error when user starts typing
    if (error) setError(null)
    if (validationErrors[name]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
    }
  }

  const validateForm = () => {
    const errors: Record<string, string> = {}

    if (!formData.oldPassword) {
      errors.oldPassword = 'Le mot de passe actuel est requis'
    }

    if (!formData.newPassword) {
      errors.newPassword = 'Nouveau mot de passe requis'
    } else if (formData.newPassword.length < 8) {
      errors.newPassword = 'Le mot de passe doit contenir au moins 8 caractères'
    }

    if (!formData.confirmPassword) {
      errors.confirmPassword = 'Veuillez confirmer votre nouveau mot de passe'
    } else if (formData.newPassword !== formData.confirmPassword) {
      errors.confirmPassword = 'Les mots de passe ne correspondent pas'
    }

    if (formData.oldPassword === formData.newPassword) {
      errors.newPassword = 'Le nouveau mot de passe doit être différent du mot de passe actuel'
    }

    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(false)

    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)

    try {
      await changePassword(formData.oldPassword, formData.newPassword)
      setSuccess(true)
      setFormData({
        oldPassword: '',
        newPassword: '',
        confirmPassword: ''
      })
      // Clear success message after 5 seconds
      setTimeout(() => setSuccess(false), 5000)
    } catch (err: any) {
      const errorMessage = err?.response?.data?.error || err?.message || 'Échec du changement de mot de passe. Veuillez réessayer.'
      setError(errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  const togglePasswordVisibility = (field: 'old' | 'new' | 'confirm') => {
    setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }))
  }

  return (
    <div className="p-6 lg:p-8 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl lg:text-3xl font-bold mb-2" style={{ color: '#1F2937' }}>
          Changer le mot de passe
        </h1>
        <p className="text-sm lg:text-base" style={{ color: '#6B7280' }}>
          Mettez à jour votre mot de passe pour sécuriser votre compte
        </p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border p-6 lg:p-8" style={{ borderColor: '#E5E7EB' }}>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Success Message */}
          {success && (
            <div className="flex items-center gap-3 p-4 rounded-lg" style={{ backgroundColor: '#F0FDF4', border: '1px solid #86EFAC' }}>
              <CheckCircle size={20} style={{ color: '#16A34A' }} />
              <p className="text-sm font-medium" style={{ color: '#16A34A' }}>
                Mot de passe modifié avec succès !
              </p>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="flex items-center gap-3 p-4 rounded-lg" style={{ backgroundColor: '#FEF2F2', border: '1px solid #FCA5A5' }}>
              <XCircle size={20} style={{ color: '#DC2626' }} />
              <p className="text-sm font-medium" style={{ color: '#DC2626' }}>
                {error}
              </p>
            </div>
          )}

          {/* Current Password */}
          <div>
            <label className="block text-sm font-semibold mb-2" style={{ color: '#374151' }}>
              Mot de passe actuel
            </label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                <Lock size={18} style={{ color: '#9CA3AF' }} />
              </div>
              <input
                type={showPasswords.old ? 'text' : 'password'}
                name="oldPassword"
                value={formData.oldPassword}
                onChange={handleChange}
                className="w-full pl-10 pr-10 py-2.5 text-sm rounded-lg border transition-all duration-200 focus:outline-none focus:ring-2"
                style={{
                  borderColor: validationErrors.oldPassword ? '#DC2626' : '#E5E7EB',
                  color: '#374151',
                  background: '#FAFBFC'
                }}
                placeholder="Entrez votre mot de passe actuel"
                onFocus={(e: React.FocusEvent<HTMLInputElement>) => {
                  e.currentTarget.style.borderColor = '#FF8C00'
                  e.currentTarget.style.background = '#FFFFFF'
                  e.currentTarget.style.boxShadow = '0 0 0 3px rgba(255, 140, 0, 0.08)'
                }}
                onBlur={(e: React.FocusEvent<HTMLInputElement>) => {
                  e.currentTarget.style.borderColor = validationErrors.oldPassword ? '#DC2626' : '#E5E7EB'
                  e.currentTarget.style.background = '#FAFBFC'
                  e.currentTarget.style.boxShadow = 'none'
                }}
              />
              <button
                type="button"
                onClick={() => togglePasswordVisibility('old')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 hover:bg-gray-50 rounded transition-colors"
                style={{ color: '#6B7280' }}
              >
                {showPasswords.old ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {validationErrors.oldPassword && (
              <p className="mt-1 text-xs" style={{ color: '#DC2626' }}>
                {validationErrors.oldPassword}
              </p>
            )}
          </div>

          {/* New Password */}
          <div>
            <label className="block text-sm font-semibold mb-2" style={{ color: '#374151' }}>
              Nouveau mot de passe
            </label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                <Lock size={18} style={{ color: '#9CA3AF' }} />
              </div>
              <input
                type={showPasswords.new ? 'text' : 'password'}
                name="newPassword"
                value={formData.newPassword}
                onChange={handleChange}
                className="w-full pl-10 pr-10 py-2.5 text-sm rounded-lg border transition-all duration-200 focus:outline-none focus:ring-2"
                style={{
                  borderColor: validationErrors.newPassword ? '#DC2626' : '#E5E7EB',
                  color: '#374151',
                  background: '#FAFBFC'
                }}
                placeholder="Entrez votre nouveau mot de passe (min. 8 caractères)"
                onFocus={(e: React.FocusEvent<HTMLInputElement>) => {
                  e.currentTarget.style.borderColor = '#FF8C00'
                  e.currentTarget.style.background = '#FFFFFF'
                  e.currentTarget.style.boxShadow = '0 0 0 3px rgba(255, 140, 0, 0.08)'
                }}
                onBlur={(e: React.FocusEvent<HTMLInputElement>) => {
                  e.currentTarget.style.borderColor = validationErrors.newPassword ? '#DC2626' : '#E5E7EB'
                  e.currentTarget.style.background = '#FAFBFC'
                  e.currentTarget.style.boxShadow = 'none'
                }}
              />
              <button
                type="button"
                onClick={() => togglePasswordVisibility('new')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 hover:bg-gray-50 rounded transition-colors"
                style={{ color: '#6B7280' }}
              >
                {showPasswords.new ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {validationErrors.newPassword && (
              <p className="mt-1 text-xs" style={{ color: '#DC2626' }}>
                {validationErrors.newPassword}
              </p>
            )}
            <p className="mt-1 text-xs" style={{ color: '#6B7280' }}>
              Le mot de passe doit contenir au moins 8 caractères
            </p>
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-sm font-semibold mb-2" style={{ color: '#374151' }}>
              Confirmer le nouveau mot de passe
            </label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                <Lock size={18} style={{ color: '#9CA3AF' }} />
              </div>
              <input
                type={showPasswords.confirm ? 'text' : 'password'}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="w-full pl-10 pr-10 py-2.5 text-sm rounded-lg border transition-all duration-200 focus:outline-none focus:ring-2"
                style={{
                  borderColor: validationErrors.confirmPassword ? '#DC2626' : '#E5E7EB',
                  color: '#374151',
                  background: '#FAFBFC'
                }}
                placeholder="Confirmez votre nouveau mot de passe"
                onFocus={(e: React.FocusEvent<HTMLInputElement>) => {
                  e.currentTarget.style.borderColor = '#FF8C00'
                  e.currentTarget.style.background = '#FFFFFF'
                  e.currentTarget.style.boxShadow = '0 0 0 3px rgba(255, 140, 0, 0.08)'
                }}
                onBlur={(e: React.FocusEvent<HTMLInputElement>) => {
                  e.currentTarget.style.borderColor = validationErrors.confirmPassword ? '#DC2626' : '#E5E7EB'
                  e.currentTarget.style.background = '#FAFBFC'
                  e.currentTarget.style.boxShadow = 'none'
                }}
              />
              <button
                type="button"
                onClick={() => togglePasswordVisibility('confirm')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 hover:bg-gray-50 rounded transition-colors"
                style={{ color: '#6B7280' }}
              >
                {showPasswords.confirm ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {validationErrors.confirmPassword && (
              <p className="mt-1 text-xs" style={{ color: '#DC2626' }}>
                {validationErrors.confirmPassword}
              </p>
            )}
          </div>

          {/* Submit Button */}
          <div className="pt-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full lg:w-auto px-6 py-2.5 rounded-lg font-semibold text-sm transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              style={{
                background: isSubmitting ? '#9CA3AF' : '#111827',
                color: 'white'
              }}
            >
              {isSubmitting ? (
                <>
                  <Spinner size="sm" color="white" />
                  <span>Modification du mot de passe...</span>
                </>
              ) : (
                <>
                  <Lock size={16} />
                  <span>Changer le mot de passe</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Security Tips */}
      <div className="mt-6 bg-blue-50 rounded-xl border p-6" style={{ borderColor: '#BFDBFE' }}>
        <h3 className="text-sm font-semibold mb-3" style={{ color: '#1E40AF' }}>
          Conseils de sécurité pour les mots de passe
        </h3>
        <ul className="space-y-2 text-xs" style={{ color: '#1E3A8A' }}>
          <li className="flex items-start gap-2">
            <span>•</span>
            <span>Utilisez une combinaison de lettres, de chiffres et de caractères spéciaux</span>
          </li>
          <li className="flex items-start gap-2">
            <span>•</span>
            <span>Évitez d'utiliser des informations personnelles comme votre nom ou votre e‑mail</span>
          </li>
          <li className="flex items-start gap-2">
            <span>•</span>
            <span>N'utilisez pas le même mot de passe que pour d'autres comptes</span>
          </li>
          <li className="flex items-start gap-2">
            <span>•</span>
            <span>Changez votre mot de passe régulièrement pour une meilleure sécurité</span>
          </li>
        </ul>
      </div>
    </div>
  )
}


