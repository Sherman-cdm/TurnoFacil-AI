'use client';
import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAgenda } from '@/lib/agenda/use-agenda';
import AuthForm from './AuthForm';
import BusinessForm from './BusinessForm';
import ServiceForm from './ServiceForm';
import HoursForm from './HoursForm';
import { secondary, control, Section } from './Fields';
export default function AgendaDashboard() {
  const agenda = useAgenda();
  const [businessId, setBusinessId] = useState('');
  const [logoutError, setLogoutError] = useState('');
  const business = agenda.data?.negocios.find(item => item.id === businessId) || agenda.data?.negocios[0];
  if (!agenda.ready) return <p role="status">Cargando acceso seguro…</p>;
  if (!agenda.session || agenda.recovery) return <><AuthForm recovery={agenda.recovery} onRecovered={() => agenda.setRecovery(false)} />{agenda.error && <p className="mt-4 text-center text-red-700" role="alert">{agenda.error}</p>}</>;
  async function logout() {
    const result = await supabase?.auth.signOut();
    if (result?.error) setLogoutError('No pudimos cerrar sesión. Intentá nuevamente.');
  }
  return <div className="grid gap-6">
    <div className="flex flex-wrap items-center justify-between gap-3"><p className="min-w-0 break-all text-sm text-slate-600">{agenda.session.user.email}</p><div className="flex flex-wrap gap-2"><button className={secondary} onClick={() => void agenda.refresh()} disabled={agenda.busy}>Actualizar</button><button className={secondary} onClick={() => void logout()}>Cerrar sesión</button></div></div>
    {(agenda.error || logoutError) && <p className="rounded-xl bg-red-50 p-4 text-red-800" role="alert">{agenda.error || logoutError}</p>}
    {agenda.busy && <p role="status" className="text-sm text-slate-600">Actualizando agenda…</p>}
    {agenda.data && <>
      {agenda.data.negocios.length > 1 && <label className="grid gap-1 text-sm">Negocio<select className={control} value={business?.id} onChange={event => setBusinessId(event.target.value)}>{agenda.data.negocios.map(item => <option value={item.id} key={item.id}>{item.nombre}</option>)}</select></label>}
      <div className="grid items-start gap-6 lg:grid-cols-2">
        <BusinessForm key={business?.id || 'nuevo'} business={business} busy={agenda.busy} save={agenda.mutate} />
        {business && <ServiceForm key={business.id} negocioId={business.id} services={agenda.data.servicios.filter(item => item.negocio_id === business.id)} busy={agenda.busy} save={agenda.mutate} />}
        {business && <HoursForm key={business.id} negocioId={business.id} hours={agenda.data.horarios.filter(item => item.negocio_id === business.id)} busy={agenda.busy} save={agenda.mutate} />}
        {business && <Section title="Turnos reservados">
          <p className="mb-4 text-sm text-slate-600">Desde los últimos 30 días y próximos turnos, hasta 500 registros. Horas en {business.zona_horaria}.</p>
          <div className="grid gap-3">{agenda.data.turnos.filter(item => item.negocio_id === business.id).map(turno => <article key={turno.id} className="min-w-0 rounded-xl border border-slate-200 p-4">
            <h3 className="break-words font-semibold">{turno.cliente_nombre}</h3>
            <p className="text-sm">{new Intl.DateTimeFormat('es-AR', { timeZone: business.zona_horaria, dateStyle: 'medium', timeStyle: 'short' }).format(new Date(turno.fecha_hora_inicio))}</p>
            <p className="break-all text-sm text-slate-600">{turno.cliente_telefono}</p>
            <p className="text-sm text-slate-600">{agenda.data?.servicios.find(service => service.id === turno.servicio_id)?.nombre || 'Servicio retirado'}</p>
            <label className="mt-3 grid gap-1 text-sm">Estado<select className={control} disabled={agenda.busy} value={turno.estado} onChange={event => {
              const estado = event.target.value as 'pendiente'|'confirmado'|'cancelado';
              if (window.confirm(`¿Cambiar el turno a ${estado}?`)) void agenda.mutate({ action: 'estado_turno', id: turno.id, negocio_id: business.id, estado });
            }}><option value="pendiente">Pendiente</option><option value="confirmado">Confirmado</option><option value="cancelado">Cancelado</option></select></label>
          </article>)}
          {!agenda.data.turnos.some(item => item.negocio_id === business.id) && <p className="text-sm text-slate-600">Todavía no hay turnos reservados en este período.</p>}
          </div>
        </Section>}
      </div>
    </>}
  </div>;
}

