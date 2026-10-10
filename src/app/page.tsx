'use client';

import React, { useState, useEffect } from 'react';
import NavbarTurnofa from '@/components/turnofa/NavbarTurnofa';
import TurnosCalendario from '@/components/turnofa/TurnosCalendario';
import NuevoTurnoModal from '@/components/turnofa/NuevoTurnoModal';
import ClientesDirectorio from '@/components/turnofa/ClientesDirectorio';
import RecordatoriosPanel from '@/components/turnofa/RecordatoriosPanel';
import AiAssistantPanel from '@/components/turnofa/AiAssistantPanel';
import ReceptionLoginModal from '@/components/turnofa/ReceptionLoginModal';
import { Turno, Cliente, EstadoTurno } from '@/types/turnofa';
import { Calendar, Users, Bell, Sparkles, UserPlus, CheckCircle, Clock, ShieldCheck, Mail, Lock, ArrowRight } from 'lucide-react';
import { SERVICIOS_ESTETICA_PIES } from '@/lib/servicios-estetica';

export default function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState<'agenda' | 'nuevo-turno' | 'clientes' | 'recordatorios' | 'asistente'>('agenda');
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isNuevoTurnoModalOpen, setIsNuevoTurnoModalOpen] = useState(false);
  const [clientePreseleccionado, setClientePreseleccionado] = useState<Cliente | null>(null);

  // Datos globales
  const [turnos, setTurnos] = useState<Turno[]>([]);
  const [loadingTurnos, setLoadingTurnos] = useState(true);
  const [pendientesCount, setPendientesCount] = useState(0);

  // Formulario rápido de login en landing si no está logueado
  const [landingEmail, setLandingEmail] = useState('gm89168@gmail');
  const [landingPassword, setLandingPassword] = useState('Cmd123');
  const [landingLoading, setLandingLoading] = useState(false);
  const [landingError, setLandingError] = useState('');

  // Verificar sesión al cargar
  useEffect(() => {
    fetch('/api/auth/reception')
      .then(r => r.json())
      .then(data => {
        if (data.authenticated) {
          setIsAuthenticated(true);
        }
      })
      .catch(() => {});
  }, []);

  // Cargar turnos y recordatorios
  async function cargarDatos() {
    setLoadingTurnos(true);
    try {
      const resTurnos = await fetch('/api/turnos');
      const dataTurnos = await resTurnos.json();
      if (dataTurnos.ok && Array.isArray(dataTurnos.turnos)) {
        setTurnos(dataTurnos.turnos);
      }

      const resRec = await fetch('/api/recordatorios');
      const dataRec = await resRec.json();
      if (dataRec.ok) {
        setPendientesCount(dataRec.totalPendientes || 0);
      }
    } catch {
      // Ignorar
    } finally {
      setLoadingTurnos(false);
    }
  }

  useEffect(() => {
    if (isAuthenticated) {
      cargarDatos();
    }
  }, [isAuthenticated]);

  async function handleLogout() {
    await fetch('/api/auth/reception', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'logout' })
    });
    setIsAuthenticated(false);
  }

  async function handleLandingLogin(e: React.FormEvent) {
    e.preventDefault();
    setLandingLoading(true);
    setLandingError('');

    try {
      const res = await fetch('/api/auth/reception', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: landingEmail, password: landingPassword })
      });
      const data = await res.json();
      if (res.ok && data.ok) {
        setIsAuthenticated(true);
      } else {
        setLandingError(data.error || 'Credenciales inválidas.');
      }
    } catch {
      setLandingError('Error de conexión.');
    } finally {
      setLandingLoading(false);
    }
  }

  async function handleActualizarEstado(id: string, nuevoEstado: EstadoTurno) {
    try {
      const res = await fetch('/api/turnos', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, estado: nuevoEstado })
      });
      if (res.ok) {
        cargarDatos();
      }
    } catch {
      // Ignorar
    }
  }

  async function handleEliminarTurno(id: string) {
    if (!confirm('¿Estás seguro de que deseás cancelar este turno?')) return;
    try {
      const res = await fetch(`/api/turnos?id=${encodeURIComponent(id)}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        cargarDatos();
      }
    } catch {
      // Ignorar
    }
  }

  async function handleEnviarRecordatorio(turnoId: string, tipo: '1_dia_antes' | 'momento_turno') {
    try {
      const res = await fetch('/api/recordatorios', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ turnoId, tipo })
      });
      const data = await res.json();
      if (res.ok && data.ok) {
        alert(data.mensaje || 'Recordatorio enviado vía Gmail');
        cargarDatos();
      }
    } catch {
      // Ignorar
    }
  }

  function handleAgendarTurnoCliente(cliente: Cliente) {
    setClientePreseleccionado(cliente);
    setIsNuevoTurnoModalOpen(true);
  }

  const [hoyStr, setHoyStr] = useState('');

  useEffect(() => {
    setHoyStr(new Date().toISOString().split('T')[0]);
  }, []);

  const turnosHoy = hoyStr ? turnos.filter(t => t.fecha_hora.startsWith(hoyStr)) : [];
  const turnosConfirmados = turnos.filter(t => t.estado === 'confirmado');

  return (
    <div className="flex flex-col min-h-screen bg-slate-50/70 text-slate-800">
      
      {/* Barra de Navegación de TURNOFA */}
      <NavbarTurnofa
        activeTab={activeTab}
        setActiveTab={(tab) => {
          if (tab === 'nuevo-turno') {
            setClientePreseleccionado(null);
            setIsNuevoTurnoModalOpen(true);
          } else {
            setActiveTab(tab);
          }
        }}
        isAuthenticated={isAuthenticated}
        onOpenLogin={() => setIsLoginModalOpen(true)}
        onLogout={handleLogout}
        pendientesCount={pendientesCount}
      />

      {/* Contenido Principal */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        
        {isAuthenticated ? (
          /* ========================================================
             VISTA DEL PANEL DE RECEPCIÓN AUTENTICADA
             ======================================================== */
          <div className="space-y-6 animate-in fade-in duration-300">
            
            {/* Tarjetas de Métricas Rápidas */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              
              <div
                onClick={() => setActiveTab('agenda')}
                className="cursor-pointer bg-white p-4 sm:p-5 rounded-3xl border border-teal-100 shadow-xs hover:border-teal-300 transition-all flex items-center gap-3 sm:gap-4"
              >
                <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center text-xl shrink-0">
                  📅
                </div>
                <div>
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Turnos de Hoy</span>
                  <span className="text-xl sm:text-2xl font-black text-slate-900">{turnosHoy.length}</span>
                </div>
              </div>

              <div
                onClick={() => setActiveTab('agenda')}
                className="cursor-pointer bg-white p-4 sm:p-5 rounded-3xl border border-emerald-100 shadow-xs hover:border-emerald-300 transition-all flex items-center gap-3 sm:gap-4"
              >
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-xl shrink-0">
                  ✨
                </div>
                <div>
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Confirmados</span>
                  <span className="text-xl sm:text-2xl font-black text-slate-900">{turnosConfirmados.length}</span>
                </div>
              </div>

              <div
                onClick={() => setActiveTab('recordatorios')}
                className="cursor-pointer bg-white p-4 sm:p-5 rounded-3xl border border-amber-100 shadow-xs hover:border-amber-300 transition-all flex items-center gap-3 sm:gap-4"
              >
                <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center text-xl shrink-0">
                  🔔
                </div>
                <div>
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Avisos Pendientes</span>
                  <span className="text-xl sm:text-2xl font-black text-amber-700">{pendientesCount}</span>
                </div>
              </div>

              <div
                onClick={() => setActiveTab('asistente')}
                className="cursor-pointer bg-white p-4 sm:p-5 rounded-3xl border border-cyan-100 shadow-xs hover:border-cyan-300 transition-all flex items-center gap-3 sm:gap-4"
              >
                <div className="w-12 h-12 rounded-2xl bg-cyan-50 text-cyan-600 flex items-center justify-center text-xl shrink-0">
                  🤖
                </div>
                <div>
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Asistente IA</span>
                  <span className="text-xs font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-full inline-block mt-0.5">
                    Activo (Gemini)
                  </span>
                </div>
              </div>

            </div>

            {/* Pestaña Activa */}
            {activeTab === 'agenda' && (
              <TurnosCalendario
                turnos={turnos}
                loading={loadingTurnos}
                onActualizarEstado={handleActualizarEstado}
                onEliminarTurno={handleEliminarTurno}
                onEnviarRecordatorio={handleEnviarRecordatorio}
                onNuevoTurnoClick={() => {
                  setClientePreseleccionado(null);
                  setIsNuevoTurnoModalOpen(true);
                }}
              />
            )}

            {activeTab === 'clientes' && (
              <ClientesDirectorio
                onAgendarTurnoCliente={handleAgendarTurnoCliente}
              />
            )}

            {activeTab === 'recordatorios' && (
              <RecordatoriosPanel
                onRecordatorioEnviado={cargarDatos}
              />
            )}

            {activeTab === 'asistente' && (
              <AiAssistantPanel />
            )}

          </div>
        ) : (
          /* ========================================================
             VISTA DE INGRESO Y PRESENTACIÓN PARA RECEPCIÓN
             ======================================================== */
          <div className="max-w-4xl mx-auto space-y-10 py-6 animate-in fade-in duration-300">
            
            {/* Hero / Encabezado Principal */}
            <div className="text-center space-y-4">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-teal-50 border border-teal-200 text-teal-800 text-xs font-bold">
                <span className="text-sm">🦶</span>
                <span>Plataforma Exclusiva para Recepción de Estética de Pies</span>
              </div>

              <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-slate-900 leading-tight">
                TURNO<span className="text-teal-600">FA</span>
              </h1>
              
              <p className="max-w-2xl mx-auto text-sm sm:text-base text-slate-600 leading-relaxed">
                Agenda inteligente para el control integral de turnos podológicos y spa de pies. Almacena clientes con <strong>DNI, teléfono y Gmail</strong>, y automatiza recordatorios de citas <strong>1 día antes</strong> y <strong>en el momento del turno</strong>.
              </p>
            </div>

            {/* Tarjeta de Ingreso Directo de Recepción */}
            <div className="bg-white rounded-3xl shadow-xl border border-teal-100 p-6 sm:p-8 max-w-lg mx-auto">
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
                <div className="w-11 h-11 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center font-bold text-xl">
                  <Lock className="w-5 h-5 text-teal-600" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Ingreso a la Recepción</h3>
                  <p className="text-xs text-slate-500">Credenciales designadas para gestión de agenda</p>
                </div>
              </div>

              {landingError && (
                <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl font-medium">
                  {landingError}
                </div>
              )}

              <form onSubmit={handleLandingLogin} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Gmail de Recepción
                  </label>
                  <input
                    type="text"
                    required
                    value={landingEmail}
                    onChange={(e) => setLandingEmail(e.target.value)}
                    placeholder="gm89168@gmail"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Contraseña Designada
                  </label>
                  <input
                    type="password"
                    required
                    value={landingPassword}
                    onChange={(e) => setLandingPassword(e.target.value)}
                    placeholder="Cmd123"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition-all"
                  />
                </div>

                <button
                  type="submit"
                  disabled={landingLoading}
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 shadow-md shadow-teal-600/20 disabled:opacity-50 transition-all hover:scale-[1.01] active:scale-[0.99]"
                >
                  {landingLoading ? 'Verificando...' : (
                    <>
                      <span>Entrar al Panel de Recepción</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

              <div className="mt-4 p-3 rounded-2xl bg-teal-50/70 border border-teal-100 text-center text-xs text-teal-800">
                Credenciales listas: <strong className="font-mono">gm89168@gmail</strong> · <strong className="font-mono">Cmd123</strong>
              </div>
            </div>

            {/* Catálogo de Servicios Podológicos en TURNOFA */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-teal-100 shadow-xs">
              <h3 className="text-lg font-bold text-slate-900 mb-1 flex items-center gap-2">
                <span>🦶</span> Tratamientos y Servicios de Estética de Pies
              </h3>
              <p className="text-xs text-slate-500 mb-6">
                Servicios disponibles en la recepción de TURNOFA para agendar a los clientes.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {SERVICIOS_ESTETICA_PIES.map((serv) => (
                  <div key={serv.id} className="p-4 rounded-2xl border border-slate-100 bg-slate-50/50 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-800">{serv.nombre}</span>
                        <span className="text-xs font-black text-teal-700">${serv.precio.toLocaleString('es-AR')}</span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">{serv.descripcion}</p>
                    </div>
                    <span className="text-[10px] text-slate-400 mt-3 block font-mono">⏱️ {serv.duracion_minutos} min</span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

      </main>

      {/* Modal para Crear Turno */}
      <NuevoTurnoModal
        isOpen={isNuevoTurnoModalOpen}
        onClose={() => setIsNuevoTurnoModalOpen(false)}
        onTurnoCreado={() => {
          cargarDatos();
          setActiveTab('agenda');
        }}
        clientePreseleccionado={clientePreseleccionado}
      />

      {/* Modal para Login de Recepción */}
      <ReceptionLoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onSuccess={() => {
          setIsAuthenticated(true);
          cargarDatos();
        }}
      />

      {/* Pie de Página */}
      <footer className="mt-auto border-t border-teal-100 bg-white py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="font-black text-sm text-slate-800">TURNO<span className="text-teal-600">FA</span></span>
            <span className="text-slate-400">·</span>
            <span>Estética de Pies & Podología</span>
          </div>
          <div>
            Base de datos Supabase conectada · Recepción: <span className="font-mono text-teal-600">gm89168@gmail</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
