'use client'

import { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { User, LoginCredentials, RegisterCredentials } from '@/types/user'

interface Anuncio {
  id: string
  titulo: string
  contenido: string
  userId: string
  user?: User
  creadoEn: string
}

interface Favorito {
  id: string
  anuncioId: string
  anuncio: Anuncio
}

export default function HomePage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [token, setToken] = useState('')
  const [user, setUser] = useState<User | null>(null)
  const [anuncios, setAnuncios] = useState<Anuncio[]>([])
  const [favoritos, setFavoritos] = useState<Favorito[]>([])
  const [showRegister, setShowRegister] = useState(false)
  const [titulo, setTitulo] = useState('')
  const [contenido, setContenido] = useState('')
  const [editandoAnuncio, setEditandoAnuncio] = useState<{ id: string; titulo: string; contenido: string } | null>(null)
  const router = useRouter()

  // Cargar el usuario desde localStorage al iniciar
  useEffect(() => {
    const savedToken = localStorage.getItem('token')
    const savedUser = localStorage.getItem('user')
    
    if (savedToken && savedUser) {
      setToken(savedToken)
      setUser(JSON.parse(savedUser))
    }
  }, [])

  const registrar = async () => {
    try {
      setError('')
      setLoading(true)
      
      if (!email || !password || !name) {
        setError('Por favor completa todos los campos')
        return
      }

      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name } as RegisterCredentials)
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.message || 'Error al registrar usuario')
      }

      // Guardar el token en localStorage
      if (data.token) {
        localStorage.setItem('token', data.token)
        localStorage.setItem('user', JSON.stringify(data.user))
        setToken(data.token)
        setUser(data.user)
      }

      alert(data.message || 'Usuario registrado exitosamente')
      setEmail('')
      setPassword('')
      setName('')
      setShowRegister(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al registrar usuario')
    } finally {
      setLoading(false)
    }
  }

  const login = async () => {
    try {
      setError('')
      setLoading(true)

      if (!email || !password) {
        setError('Por favor completa todos los campos')
        return
      }

      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password } as LoginCredentials)
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.message || 'Error al iniciar sesión')
      }

      if (data.token) {
        // Guardar el token en localStorage
        localStorage.setItem('token', data.token)
        localStorage.setItem('user', JSON.stringify(data.user))
        setToken(data.token)
        setUser(data.user)
        setEmail('')
        setPassword('')
      } else {
        throw new Error(data.message || 'Error al iniciar sesión')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al iniciar sesión')
    } finally {
      setLoading(false)
    }
  }

  const logout = () => {
    // Limpiar localStorage
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setToken('')
    setUser(null)
  }

  const crearAnuncio = async () => {
    const res = await fetch('/api/anuncios', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ titulo, contenido })
    })
    if (res.ok) {
      setTitulo('')
      setContenido('')
      cargarAnuncios()
    }
  }

  const editarAnuncio = async (id: string) => {
    try {
      setError('')
      setLoading(true)

      const res = await fetch(`/api/anuncios/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          titulo: editandoAnuncio?.titulo,
          contenido: editandoAnuncio?.contenido
        })
      })

      if (!res.ok) {
        throw new Error('Error al editar el anuncio')
      }

      setEditandoAnuncio(null)
      cargarAnuncios()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al editar el anuncio')
    } finally {
      setLoading(false)
    }
  }

  const borrarAnuncio = async (id: string) => {
    if (!confirm('¿Estás seguro de que quieres borrar este anuncio?')) {
      return
    }

    try {
      setError('')
      setLoading(true)

      const res = await fetch(`/api/anuncios/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      if (!res.ok) {
        throw new Error('Error al borrar el anuncio')
      }

      cargarAnuncios()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al borrar el anuncio')
    } finally {
      setLoading(false)
    }
  }

  const cargarAnuncios = async () => {
    try {
      const res = await fetch('/api/anuncios')
      const data = await res.json()
      setAnuncios(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error('Error fetching announcements:', err)
      setError('Error al cargar los anuncios')
      setAnuncios([])
    } finally {
      setLoading(false)
    }
  }

  const cargarFavoritos = useCallback(async () => {
    if (!token) return
    try {
      const res = await fetch('/api/favoritos', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      const data = await res.json()
      setFavoritos(data)
    } catch {
      setError('Error al cargar favoritos')
    }
  }, [token])

  const toggleFavorito = async (anuncioId: string) => {
    if (!token) return
    try {
      const esFavorito = favoritos.some(f => f.anuncioId === anuncioId)
      const method = esFavorito ? 'DELETE' : 'POST'
      
      const res = await fetch('/api/favoritos', {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ anuncioId })
      })

      if (!res.ok) {
        throw new Error('Error al actualizar favoritos')
      }

      await cargarFavoritos()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al actualizar favoritos')
    }
  }

  useEffect(() => {
    if (token) {
      cargarFavoritos()
    }
  }, [token, cargarFavoritos])

  useEffect(() => {
    cargarAnuncios()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <h2 className="text-2xl font-semibold text-gray-700">Cargando...</h2>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900">Error</h2>
            <p className="mt-2 text-red-600">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
            >
              Intentar de nuevo
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 relative py-8 px-4 sm:px-6 lg:px-8">
      {/* Patrón de fondo decorativo */}
      <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] opacity-20"></div>
      
      <div className="max-w-6xl mx-auto relative">
        {!user ? (
          // Layout cuando no hay usuario
          <div className="max-w-2xl mx-auto">
            <h1 className="text-4xl font-bold text-center text-gray-900 mb-8 bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">Sistema de Anuncios</h1>
            
            <div className="bg-white/80 backdrop-blur-sm rounded-lg shadow-lg p-8 border border-gray-100">
              <h2 className="text-2xl font-semibold text-gray-800 mb-6 text-center">Acceso</h2>
              {error && (
                <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                  {error}
                </div>
              )}
              <div className="space-y-6">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <input
                    id="email"
                    type="email"
                    className="mt-1 block w-full rounded-lg border-gray-200 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 bg-white/50 backdrop-blur-sm text-lg py-3 px-4"
                    placeholder="tu@email.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    disabled={loading}
                  />
                </div>
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">Contraseña</label>
                  <input
                    id="password"
                    type="password"
                    className="mt-1 block w-full rounded-lg border-gray-200 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 bg-white/50 backdrop-blur-sm text-lg py-3 px-4"
                    placeholder="••••••••"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    disabled={loading}
                  />
                </div>
                <div className="flex space-x-4">
                  <button
                    onClick={() => setShowRegister(true)}
                    className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 transform hover:scale-105 shadow-md disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 cursor-pointer font-medium"
                    disabled={loading}
                  >
                    {loading ? 'Procesando...' : 'Registrarse'}
                  </button>
                  <button
                    onClick={login}
                    className="flex-1 bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-6 py-3 rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-all duration-200 transform hover:scale-105 shadow-md disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 cursor-pointer font-medium"
                    disabled={loading}
                  >
                    {loading ? 'Procesando...' : 'Iniciar sesión'}
                  </button>
                </div>
              </div>
            </div>

            {/* Anuncios centrados cuando no hay usuario */}
            <div className="mt-8 bg-white/80 backdrop-blur-sm rounded-lg shadow-lg p-6 border border-gray-100">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4 text-center">Anuncios</h2>
              {error && (
                <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                  {error}
                </div>
              )}
              <div className="space-y-4">
                {anuncios.map((a: Anuncio) => (
                  <div key={a.id} className="border-b border-gray-200 pb-4 last:border-0">
                    <h3 className="text-lg font-medium text-gray-900">{a.titulo}</h3>
                    <p className="mt-2 text-gray-600">{a.contenido}</p>
                    <p className="mt-2 text-sm text-gray-500">Publicado por: {a.user?.name || a.user?.email}</p>
                  </div>
                ))}
                {anuncios.length === 0 && (
                  <p className="text-gray-500 text-center py-4">No hay anuncios disponibles</p>
                )}
              </div>
            </div>
          </div>
        ) : (
          // Layout cuando hay usuario
          <>
            <div className="flex justify-between items-center mb-8">
              <h1 className="text-4xl font-bold text-gray-900 bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">Sistema de Anuncios</h1>
              <div className="flex items-center space-x-4">
                <span className="text-gray-700">¡Hola, {user.name}!</span>
                <button
                  onClick={logout}
                  className="bg-gradient-to-r from-red-600 to-pink-600 text-white px-4 py-2 rounded-lg hover:from-red-700 hover:to-pink-700 transition-all duration-200 transform hover:scale-105 shadow-md cursor-pointer font-medium"
                >
                  Cerrar sesión
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Main Content */}
              <div className="lg:col-span-2">
                {/* Create Announcement Section */}
                <div className="bg-white/80 backdrop-blur-sm rounded-lg shadow-lg p-6 mb-8 border border-gray-100">
                  <h2 className="text-2xl font-semibold text-gray-800 mb-4">Crear Anuncio</h2>
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="titulo" className="block text-sm font-medium text-gray-700 mb-2">Título</label>
                      <input
                        id="titulo"
                        className="mt-1 block w-full rounded-lg border-gray-200 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 bg-white/50 backdrop-blur-sm text-lg py-3 px-4"
                        placeholder="Título del anuncio"
                        value={titulo}
                        onChange={e => setTitulo(e.target.value)}
                      />
                    </div>
                    <div>
                      <label htmlFor="contenido" className="block text-sm font-medium text-gray-700 mb-2">Contenido</label>
                      <textarea
                        id="contenido"
                        rows={6}
                        className="mt-1 block w-full rounded-lg border-gray-200 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 bg-white/50 backdrop-blur-sm text-lg py-3 px-4"
                        placeholder="Contenido del anuncio"
                        value={contenido}
                        onChange={e => setContenido(e.target.value)}
                      />
                    </div>
                    <button
                      onClick={crearAnuncio}
                      className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 transform hover:scale-105 shadow-md cursor-pointer font-medium"
                    >
                      Publicar Anuncio
                    </button>
                  </div>
                </div>

                {/* Announcements List */}
                <div className="bg-white/80 backdrop-blur-sm rounded-lg shadow-lg p-6 border border-gray-100">
                  <h2 className="text-2xl font-semibold text-gray-800 mb-4">Anuncios</h2>
                  {error && (
                    <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                      {error}
                    </div>
                  )}
                  <div className="space-y-4">
                    {anuncios.map((a: Anuncio) => (
                      <div key={a.id} className="border-b border-gray-200 pb-4 last:border-0">
                        {editandoAnuncio && editandoAnuncio.id === a.id ? (
                          <div className="space-y-4">
                            <input
                              className="w-full rounded-lg border-gray-200 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 bg-white/50 backdrop-blur-sm"
                              value={editandoAnuncio.titulo}
                              onChange={e => setEditandoAnuncio({
                                id: editandoAnuncio.id,
                                titulo: e.target.value,
                                contenido: editandoAnuncio.contenido
                              })}
                            />
                            <textarea
                              className="w-full rounded-lg border-gray-200 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 bg-white/50 backdrop-blur-sm"
                              value={editandoAnuncio.contenido}
                              onChange={e => setEditandoAnuncio({
                                id: editandoAnuncio.id,
                                titulo: editandoAnuncio.titulo,
                                contenido: e.target.value
                              })}
                            />
                            <div className="flex space-x-2">
                              <button
                                onClick={() => editarAnuncio(a.id)}
                                className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 py-2 rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 transform hover:scale-105 shadow-md cursor-pointer font-medium"
                                disabled={loading}
                              >
                                {loading ? 'Guardando...' : 'Guardar'}
                              </button>
                              <button
                                onClick={() => setEditandoAnuncio(null)}
                                className="bg-gradient-to-r from-gray-600 to-gray-700 text-white px-4 py-2 rounded-lg hover:from-gray-700 hover:to-gray-800 transition-all duration-200 transform hover:scale-105 shadow-md cursor-pointer font-medium"
                                disabled={loading}
                              >
                                Cancelar
                              </button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <div className="flex justify-between items-start">
                              <div>
                                <h3 className="text-lg font-medium text-gray-900">{a.titulo}</h3>
                                <p className="mt-2 text-gray-600">{a.contenido}</p>
                                <p className="mt-2 text-sm text-gray-500">Publicado por: {a.user?.name || a.user?.email}</p>
                              </div>
                              {user && (
                                <button
                                  onClick={() => toggleFavorito(a.id)}
                                  className={`text-2xl cursor-pointer transition-all duration-200 transform hover:scale-110 ${
                                    favoritos.some(f => f.anuncioId === a.id)
                                      ? 'text-yellow-500 hover:text-yellow-600'
                                      : 'text-gray-400 hover:text-yellow-500'
                                  }`}
                                >
                                  ★
                                </button>
                              )}
                            </div>
                            {user && a.userId === user.id && (
                              <div className="mt-2 flex space-x-2">
                                <button
                                  onClick={() => setEditandoAnuncio({ id: a.id, titulo: a.titulo, contenido: a.contenido })}
                                  className="text-indigo-600 hover:text-indigo-800 cursor-pointer font-medium"
                                >
                                  Editar
                                </button>
                                <button
                                  onClick={() => borrarAnuncio(a.id)}
                                  className="text-red-600 hover:text-red-800 cursor-pointer font-medium"
                                >
                                  Borrar
                                </button>
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    ))}
                    {anuncios.length === 0 && (
                      <p className="text-gray-500 text-center py-4">No hay anuncios disponibles</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Favorites Sidebar */}
              <div className="lg:col-span-1">
                <div className="bg-white/80 backdrop-blur-sm rounded-lg shadow-lg p-6 sticky top-8 border border-gray-100">
                  <h2 className="text-2xl font-semibold text-gray-800 mb-4">Favoritos</h2>
                  <div className="space-y-4">
                    {favoritos.map((f: Favorito) => (
                      <div key={f.id} className="border-b border-gray-200 pb-4 last:border-0">
                        <h3 className="text-lg font-medium text-gray-900">{f.anuncio.titulo}</h3>
                        <p className="mt-2 text-gray-600 line-clamp-2">{f.anuncio.contenido}</p>
                        <p className="mt-2 text-sm text-gray-500">Publicado por: {f.anuncio.user?.name || f.anuncio.user?.email}</p>
                        <button
                          onClick={() => toggleFavorito(f.anuncioId)}
                          className="mt-2 text-yellow-500 hover:text-yellow-600 cursor-pointer font-medium"
                        >
                          Quitar de favoritos
                        </button>
                      </div>
                    ))}
                    {favoritos.length === 0 && (
                      <p className="text-gray-500 text-center py-4">No tienes anuncios favoritos</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </main>
  )
}
