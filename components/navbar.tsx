"use client"

import { useEffect, useState, useRef } from "react"
import Link from "next/link"
import { useRouter, usePathname } from "next/navigation"
import { Search, Briefcase, User, LogOut } from "lucide-react"
import { authService } from "@/lib/api"

function Navbar() {
  const router = useRouter()
  const pathname = usePathname()
  const [user, setUser] = useState<any>(null)
  const [isExpanded, setIsExpanded] = useState(false)
  const [scrollDirection, setScrollDirection] = useState<'up' | 'down' | null>(null)
  const [scrollY, setScrollY] = useState(0)
  const [lastScrollY, setLastScrollY] = useState(0)
  const collapseTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    const currentUser = authService.getCurrentUser()
    if (currentUser) {
      setUser(currentUser)
    }
  }, [])

  // Detectar cambios en la ruta para ajustar el estado automáticamente
  useEffect(() => {
    if (collapseTimeoutRef.current) {
      clearTimeout(collapseTimeoutRef.current)
    }

    // Expandir automáticamente en páginas principales
    if (pathname === '/' || pathname === '/search' || pathname === '/cases') {
      setIsExpanded(true)
    } else {
      // En otras páginas, expandir inicialmente y luego contraer
      setIsExpanded(true)
      collapseTimeoutRef.current = setTimeout(() => {
        setIsExpanded(false)
      }, 2500)
    }

    return () => {
      if (collapseTimeoutRef.current) {
        clearTimeout(collapseTimeoutRef.current)
      }
    }
  }, [pathname])

  // Detectar scroll para cambiar el tamaño del navbar (Dynamic Island)
  useEffect(() => {
    let ticking = false
    let lastScrollTop = window.scrollY

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const currentScrollY = window.scrollY
          const scrollDifference = currentScrollY - lastScrollTop

          setScrollY(currentScrollY)
          
          // Determinar dirección del scroll con umbral para evitar cambios muy pequeños
          if (Math.abs(scrollDifference) > 5) {
            if (scrollDifference > 0 && currentScrollY > 80) {
              // Scroll hacia abajo significativo - achicar navbar
              setScrollDirection('down')
              // En páginas no principales, también contraer el contenido
              if (pathname !== '/' && pathname !== '/search' && pathname !== '/cases') {
                if (scrollTimeoutRef.current) {
                  clearTimeout(scrollTimeoutRef.current)
                }
                setIsExpanded(false)
              }
            } else if (scrollDifference < 0 || currentScrollY < 50) {
              // Scroll hacia arriba significativo o cerca del top - expandir navbar
              setScrollDirection('up')
              setIsExpanded(true)
              if (scrollTimeoutRef.current) {
                clearTimeout(scrollTimeoutRef.current)
              }
            }
          }

          lastScrollTop = currentScrollY > 0 ? currentScrollY : 0
          setLastScrollY(currentScrollY)
          ticking = false
        })
        ticking = true
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    
    return () => {
      window.removeEventListener('scroll', handleScroll)
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current)
      }
    }
  }, [pathname])

  // Detectar cuando el usuario está inactivo para contraer
  useEffect(() => {
    let inactivityTimer: NodeJS.Timeout | null = null

    const resetInactivityTimer = () => {
      if (inactivityTimer) {
        clearTimeout(inactivityTimer)
      }

      // Si no estamos en página principal y el navbar está expandido, contraer después de inactividad
      if (pathname !== '/' && pathname !== '/search' && pathname !== '/cases' && isExpanded) {
        inactivityTimer = setTimeout(() => {
          setIsExpanded(false)
        }, 4000)
      }
    }

    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart']
    events.forEach(event => {
      document.addEventListener(event, resetInactivityTimer, { passive: true })
    })

    resetInactivityTimer()

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, resetInactivityTimer)
      })
      if (inactivityTimer) {
        clearTimeout(inactivityTimer)
      }
    }
  }, [pathname, isExpanded])

  // Expandir cuando el usuario vuelve a la ventana
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && user) {
        setIsExpanded(true)
        if (collapseTimeoutRef.current) {
          clearTimeout(collapseTimeoutRef.current)
        }
        // Contraer después de un delay si no estamos en página principal
        if (pathname !== '/' && pathname !== '/search' && pathname !== '/cases') {
          collapseTimeoutRef.current = setTimeout(() => {
            setIsExpanded(false)
          }, 3000)
        }
      }
    }

    const handleFocus = () => {
      if (user) {
        setIsExpanded(true)
        if (collapseTimeoutRef.current) {
          clearTimeout(collapseTimeoutRef.current)
        }
        if (pathname !== '/' && pathname !== '/search' && pathname !== '/cases') {
          collapseTimeoutRef.current = setTimeout(() => {
            setIsExpanded(false)
          }, 2500)
        }
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    window.addEventListener('focus', handleFocus)

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('focus', handleFocus)
    }
  }, [user, pathname])

  // Detectar cuando el usuario hace click en algún lugar para expandir/contraer
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      const navbar = target.closest('nav')
      
      // Si el click es fuera del navbar y estamos en página no principal, contraer después de un delay
      if (!navbar && pathname !== '/' && pathname !== '/search' && pathname !== '/cases') {
        if (collapseTimeoutRef.current) {
          clearTimeout(collapseTimeoutRef.current)
        }
        collapseTimeoutRef.current = setTimeout(() => {
          setIsExpanded(false)
        }, 2000)
      }
    }

    document.addEventListener('click', handleClick)
    return () => {
      document.removeEventListener('click', handleClick)
    }
  }, [pathname])

  const handleMouseEnter = () => {
    setIsExpanded(true)
    if (collapseTimeoutRef.current) {
      clearTimeout(collapseTimeoutRef.current)
    }
  }

  const handleMouseLeave = () => {
    // Solo contraer si no estamos en página principal y no estamos cerca del top
    if (pathname !== '/' && pathname !== '/search' && pathname !== '/cases' && scrollY > 200) {
      collapseTimeoutRef.current = setTimeout(() => {
        setIsExpanded(false)
      }, 2000)
    }
  }

  const handleLogout = () => {
    authService.signOut()
    setUser(null)
    router.push("/auth/login")
  }

  const isActive = (path: string) => pathname === path

  if (!user) {
    return null
  }

  const isMainPage = pathname === '/' || pathname === '/search' || pathname === '/cases'
  
  // Calcular el tamaño y posición del navbar basado en scroll y estado (Dynamic Island)
  // Se achica al hacer scroll hacia abajo (también en páginas principales)
  const shouldShrink = scrollDirection === 'down' && scrollY > 100
  const navbarScale = shouldShrink ? 0.92 : 1
  const navbarTranslateY = shouldShrink && scrollY > 150 ? -6 : 0
  const navbarOpacity = shouldShrink ? 0.96 : 1
  
  // Padding adaptativo según el estado
  const getNavbarPadding = () => {
    if (shouldShrink) {
      return 'px-5 py-2.5'
    }
    return isExpanded ? 'px-8 py-4' : 'px-6 py-3'
  }
  
  // Tamaño del logo según el estado
  const logoSize = shouldShrink ? 'text-lg' : 'text-xl'
  
  // Tamaño de los iconos según el estado
  const iconSize = shouldShrink ? 'w-3.5 h-3.5' : 'w-4 h-4'
  
  // Tamaño del texto según el estado
  const textSize = shouldShrink ? 'text-xs' : 'text-sm'

  return (
    <nav className="fixed top-0 w-full z-50 pointer-events-none">
      <div className="max-w-7xl mx-auto px-8 py-4">
        <div 
          className={`bg-slate-900 rounded-full shadow-lg flex items-center justify-between transition-all duration-500 ease-out pointer-events-auto backdrop-blur-xl ${
            isExpanded 
              ? 'rounded-2xl shadow-xl' 
              : 'rounded-full shadow-lg'
          } ${getNavbarPadding()} ${shouldShrink ? 'gap-4' : 'gap-8'}`}
          style={{
            transform: `scale(${navbarScale}) translateY(${navbarTranslateY}px)`,
            opacity: navbarOpacity,
            transition: 'all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
            willChange: 'transform, border-radius, padding, opacity'
          }}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          {/* Logo Section */}
          <Link 
            href="/" 
            className={`font-bold text-white hover:text-gray-200 transition-all duration-500 flex-shrink-0 ${logoSize}`}
          >
            LawConnect
          </Link>

          {/* Center Navigation */}
          <div className={`hidden md:flex items-center flex-1 justify-center transition-all duration-500 ${
            isExpanded 
              ? 'opacity-100 visible scale-100 max-w-none' 
              : 'opacity-0 invisible scale-95 max-w-0 overflow-hidden'
          } ${shouldShrink ? 'gap-4' : 'gap-8'}`}>
            <Link
              href="/search"
              className={`flex items-center gap-2 font-medium transition-all duration-500 rounded-lg ${
                isActive('/search')
                  ? 'text-white bg-slate-800'
                  : 'text-gray-400 hover:text-white hover:bg-slate-800/50'
              } ${shouldShrink ? 'px-2 py-1.5' : 'px-3 py-2'} ${textSize}`}
            >
              <Search className={`transition-all duration-500 ${iconSize}`} />
              {!shouldShrink && <span>Abogados</span>}
            </Link>
            
            <Link
              href="/cases"
              className={`flex items-center gap-2 font-medium transition-all duration-500 rounded-lg ${
                isActive('/cases')
                  ? 'text-white bg-slate-800'
                  : 'text-gray-400 hover:text-white hover:bg-slate-800/50'
              } ${shouldShrink ? 'px-2 py-1.5' : 'px-3 py-2'} ${textSize}`}
            >
              <Briefcase className={`transition-all duration-500 ${iconSize}`} />
              {!shouldShrink && <span>Mis Casos</span>}
            </Link>

            {user.roles?.[0] === 'ROLE_LAWYER' && (
              <Link
                href="/cases/available"
                className={`flex items-center gap-2 font-medium transition-all duration-500 rounded-lg ${
                  isActive('/cases/available')
                    ? 'text-white bg-slate-800'
                    : 'text-gray-400 hover:text-white hover:bg-slate-800/50'
                } ${shouldShrink ? 'px-2 py-1.5' : 'px-3 py-2'} ${textSize}`}
              >
                <Briefcase className={`transition-all duration-500 ${iconSize}`} />
                {!shouldShrink && <span>Disponibles</span>}
              </Link>
            )}
          </div>

          {/* User Section */}
          <div className={`flex items-center flex-shrink-0 transition-all duration-500 ${shouldShrink ? 'gap-2' : 'gap-4'}`}>
            <Link
              href="/profile"
              className={`flex items-center gap-2 font-medium transition-all duration-500 rounded-lg ${
                isActive('/profile')
                  ? 'text-white bg-slate-800'
                  : 'text-gray-400 hover:text-white hover:bg-slate-800/50'
              } ${shouldShrink ? 'px-2 py-1.5' : 'px-3 py-2'} ${textSize}`}
            >
              <User className={`transition-all duration-500 ${iconSize}`} />
              {isExpanded && !shouldShrink && (
                <span className="hidden sm:inline transition-opacity duration-300">{user.username}</span>
              )}
            </Link>
            
            <button
              onClick={handleLogout}
              className={`text-gray-400 hover:text-white hover:bg-slate-800/50 rounded-lg transition-all duration-500 ${
                shouldShrink ? 'p-1.5' : 'p-2'
              }`}
              title="Cerrar sesión"
            >
              <LogOut className={`transition-all duration-500 ${iconSize}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className="md:hidden border-t border-gray-200 bg-white pointer-events-auto">
        <div className="flex items-center justify-around py-2">
          <Link
            href="/search"
            className={`flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition-colors ${
              isActive('/search') ? 'text-slate-900 bg-slate-100' : 'text-gray-500'
            }`}
          >
            <Search className="w-5 h-5" />
            <span className="text-xs">Abogados</span>
          </Link>
          
          <Link
            href="/cases"
            className={`flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition-colors ${
              isActive('/cases') ? 'text-slate-900 bg-slate-100' : 'text-gray-500'
            }`}
          >
            <Briefcase className="w-5 h-5" />
            <span className="text-xs">Mis Casos</span>
          </Link>

          {user.roles?.[0] === 'ROLE_LAWYER' && (
            <Link
              href="/cases/available"
              className={`flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition-colors ${
                isActive('/cases/available') ? 'text-slate-900 bg-slate-100' : 'text-gray-500'
              }`}
            >
              <Briefcase className="w-5 h-5" />
              <span className="text-xs">Disponibles</span>
            </Link>
          )}
          
          <Link
            href="/profile"
            className={`flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition-colors ${
              isActive('/profile') ? 'text-slate-900 bg-slate-100' : 'text-gray-500'
            }`}
          >
            <User className="w-5 h-5" />
            <span className="text-xs">Perfil</span>
          </Link>
        </div>
      </div>
    </nav>
  )
}

export { Navbar }
export default Navbar
