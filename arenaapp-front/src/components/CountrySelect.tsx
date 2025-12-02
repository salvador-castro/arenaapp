import { useState } from 'react'

type Country = {
  code: string
  name: string
  flag: string
}

// Podés ir sumando más países cuando quieras
const ALL_COUNTRIES: Country[] = [
  // FAVORITOS (dejarlos arriba)
  { code: 'AR', name: 'Argentina', flag: 'https://flagcdn.com/ar.svg' },
  { code: 'UY', name: 'Uruguay', flag: 'https://flagcdn.com/uy.svg' },
  { code: 'CL', name: 'Chile', flag: 'https://flagcdn.com/cl.svg' },
  { code: 'BR', name: 'Brasil', flag: 'https://flagcdn.com/br.svg' },

  // RESTO DEL MUNDO
  { code: 'AF', name: 'Afganistán', flag: 'https://flagcdn.com/af.svg' },
  { code: 'AL', name: 'Albania', flag: 'https://flagcdn.com/al.svg' },
  { code: 'DE', name: 'Alemania', flag: 'https://flagcdn.com/de.svg' },
  { code: 'AD', name: 'Andorra', flag: 'https://flagcdn.com/ad.svg' },
  { code: 'AO', name: 'Angola', flag: 'https://flagcdn.com/ao.svg' },
  { code: 'AG', name: 'Antigua y Barbuda', flag: 'https://flagcdn.com/ag.svg' },
  { code: 'SA', name: 'Arabia Saudita', flag: 'https://flagcdn.com/sa.svg' },
  { code: 'DZ', name: 'Argelia', flag: 'https://flagcdn.com/dz.svg' },
  { code: 'AM', name: 'Armenia', flag: 'https://flagcdn.com/am.svg' },
  { code: 'AU', name: 'Australia', flag: 'https://flagcdn.com/au.svg' },
  { code: 'AT', name: 'Austria', flag: 'https://flagcdn.com/at.svg' },
  { code: 'AZ', name: 'Azerbaiyán', flag: 'https://flagcdn.com/az.svg' },
  { code: 'BS', name: 'Bahamas', flag: 'https://flagcdn.com/bs.svg' },
  { code: 'BD', name: 'Bangladés', flag: 'https://flagcdn.com/bd.svg' },
  { code: 'BB', name: 'Barbados', flag: 'https://flagcdn.com/bb.svg' },
  { code: 'BH', name: 'Baréin', flag: 'https://flagcdn.com/bh.svg' },
  { code: 'BE', name: 'Bélgica', flag: 'https://flagcdn.com/be.svg' },
  { code: 'BZ', name: 'Belice', flag: 'https://flagcdn.com/bz.svg' },
  { code: 'BJ', name: 'Benín', flag: 'https://flagcdn.com/bj.svg' },
  { code: 'BY', name: 'Bielorrusia', flag: 'https://flagcdn.com/by.svg' },
  { code: 'BO', name: 'Bolivia', flag: 'https://flagcdn.com/bo.svg' },
  {
    code: 'BA',
    name: 'Bosnia y Herzegovina',
    flag: 'https://flagcdn.com/ba.svg'
  },
  { code: 'BW', name: 'Botsuana', flag: 'https://flagcdn.com/bw.svg' },
  { code: 'BN', name: 'Brunéi', flag: 'https://flagcdn.com/bn.svg' },
  { code: 'BG', name: 'Bulgaria', flag: 'https://flagcdn.com/bg.svg' },
  { code: 'BF', name: 'Burkina Faso', flag: 'https://flagcdn.com/bf.svg' },
  { code: 'BI', name: 'Burundi', flag: 'https://flagcdn.com/bi.svg' },
  { code: 'BT', name: 'Bután', flag: 'https://flagcdn.com/bt.svg' },
  { code: 'CV', name: 'Cabo Verde', flag: 'https://flagcdn.com/cv.svg' },
  { code: 'KH', name: 'Camboya', flag: 'https://flagcdn.com/kh.svg' },
  { code: 'CM', name: 'Camerún', flag: 'https://flagcdn.com/cm.svg' },
  { code: 'CA', name: 'Canadá', flag: 'https://flagcdn.com/ca.svg' },
  { code: 'QA', name: 'Catar', flag: 'https://flagcdn.com/qa.svg' },
  { code: 'TD', name: 'Chad', flag: 'https://flagcdn.com/td.svg' },
  { code: 'CN', name: 'China', flag: 'https://flagcdn.com/cn.svg' },
  { code: 'CY', name: 'Chipre', flag: 'https://flagcdn.com/cy.svg' },
  { code: 'CO', name: 'Colombia', flag: 'https://flagcdn.com/co.svg' },
  { code: 'KM', name: 'Comoras', flag: 'https://flagcdn.com/km.svg' },
  { code: 'KP', name: 'Corea del Norte', flag: 'https://flagcdn.com/kp.svg' },
  { code: 'KR', name: 'Corea del Sur', flag: 'https://flagcdn.com/kr.svg' },
  { code: 'CI', name: 'Costa de Marfil', flag: 'https://flagcdn.com/ci.svg' },
  { code: 'CR', name: 'Costa Rica', flag: 'https://flagcdn.com/cr.svg' },
  { code: 'HR', name: 'Croacia', flag: 'https://flagcdn.com/hr.svg' },
  { code: 'CU', name: 'Cuba', flag: 'https://flagcdn.com/cu.svg' },
  { code: 'DK', name: 'Dinamarca', flag: 'https://flagcdn.com/dk.svg' },
  { code: 'DM', name: 'Dominica', flag: 'https://flagcdn.com/dm.svg' },
  { code: 'EC', name: 'Ecuador', flag: 'https://flagcdn.com/ec.svg' },
  { code: 'EG', name: 'Egipto', flag: 'https://flagcdn.com/eg.svg' },
  { code: 'SV', name: 'El Salvador', flag: 'https://flagcdn.com/sv.svg' },
  {
    code: 'AE',
    name: 'Emiratos Árabes Unidos',
    flag: 'https://flagcdn.com/ae.svg'
  },
  { code: 'ER', name: 'Eritrea', flag: 'https://flagcdn.com/er.svg' },
  { code: 'SK', name: 'Eslovaquia', flag: 'https://flagcdn.com/sk.svg' },
  { code: 'SI', name: 'Eslovenia', flag: 'https://flagcdn.com/si.svg' },
  { code: 'ES', name: 'España', flag: 'https://flagcdn.com/es.svg' },
  { code: 'US', name: 'Estados Unidos', flag: 'https://flagcdn.com/us.svg' },
  { code: 'EE', name: 'Estonia', flag: 'https://flagcdn.com/ee.svg' },
  { code: 'SZ', name: 'Esuatini', flag: 'https://flagcdn.com/sz.svg' },
  { code: 'ET', name: 'Etiopía', flag: 'https://flagcdn.com/et.svg' },
  { code: 'PH', name: 'Filipinas', flag: 'https://flagcdn.com/ph.svg' },
  { code: 'FI', name: 'Finlandia', flag: 'https://flagcdn.com/fi.svg' },
  { code: 'FJ', name: 'Fiyi', flag: 'https://flagcdn.com/fj.svg' },
  { code: 'FR', name: 'Francia', flag: 'https://flagcdn.com/fr.svg' },
  { code: 'GA', name: 'Gabón', flag: 'https://flagcdn.com/ga.svg' },
  { code: 'GM', name: 'Gambia', flag: 'https://flagcdn.com/gm.svg' },
  { code: 'GE', name: 'Georgia', flag: 'https://flagcdn.com/ge.svg' },
  { code: 'GH', name: 'Ghana', flag: 'https://flagcdn.com/gh.svg' },
  { code: 'GD', name: 'Granada', flag: 'https://flagcdn.com/gd.svg' },
  { code: 'GR', name: 'Grecia', flag: 'https://flagcdn.com/gr.svg' },
  { code: 'GT', name: 'Guatemala', flag: 'https://flagcdn.com/gt.svg' },
  { code: 'GN', name: 'Guinea', flag: 'https://flagcdn.com/gn.svg' },
  { code: 'GW', name: 'Guinea-Bisáu', flag: 'https://flagcdn.com/gw.svg' },
  { code: 'GQ', name: 'Guinea Ecuatorial', flag: 'https://flagcdn.com/gq.svg' },
  { code: 'GY', name: 'Guyana', flag: 'https://flagcdn.com/gy.svg' },
  { code: 'HT', name: 'Haití', flag: 'https://flagcdn.com/ht.svg' },
  { code: 'HN', name: 'Honduras', flag: 'https://flagcdn.com/hn.svg' },
  { code: 'HU', name: 'Hungría', flag: 'https://flagcdn.com/hu.svg' },
  { code: 'IN', name: 'India', flag: 'https://flagcdn.com/in.svg' },
  { code: 'ID', name: 'Indonesia', flag: 'https://flagcdn.com/id.svg' },
  { code: 'IQ', name: 'Irak', flag: 'https://flagcdn.com/iq.svg' },
  { code: 'IR', name: 'Irán', flag: 'https://flagcdn.com/ir.svg' },
  { code: 'IE', name: 'Irlanda', flag: 'https://flagcdn.com/ie.svg' },
  { code: 'IS', name: 'Islandia', flag: 'https://flagcdn.com/is.svg' },
  { code: 'MH', name: 'Islas Marshall', flag: 'https://flagcdn.com/mh.svg' },
  { code: 'SB', name: 'Islas Salomón', flag: 'https://flagcdn.com/sb.svg' },
  { code: 'IL', name: 'Israel', flag: 'https://flagcdn.com/il.svg' },
  { code: 'IT', name: 'Italia', flag: 'https://flagcdn.com/it.svg' },
  { code: 'JM', name: 'Jamaica', flag: 'https://flagcdn.com/jm.svg' },
  { code: 'JP', name: 'Japón', flag: 'https://flagcdn.com/jp.svg' },
  { code: 'JO', name: 'Jordania', flag: 'https://flagcdn.com/jo.svg' },
  { code: 'KZ', name: 'Kazajistán', flag: 'https://flagcdn.com/kz.svg' },
  { code: 'KE', name: 'Kenia', flag: 'https://flagcdn.com/ke.svg' },
  { code: 'KG', name: 'Kirguistán', flag: 'https://flagcdn.com/kg.svg' },
  { code: 'KI', name: 'Kiribati', flag: 'https://flagcdn.com/ki.svg' },
  { code: 'KW', name: 'Kuwait', flag: 'https://flagcdn.com/kw.svg' },
  { code: 'LA', name: 'Laos', flag: 'https://flagcdn.com/la.svg' },
  { code: 'LS', name: 'Lesoto', flag: 'https://flagcdn.com/ls.svg' },
  { code: 'LV', name: 'Letonia', flag: 'https://flagcdn.com/lv.svg' },
  { code: 'LB', name: 'Líbano', flag: 'https://flagcdn.com/lb.svg' },
  { code: 'LR', name: 'Liberia', flag: 'https://flagcdn.com/lr.svg' },
  { code: 'LY', name: 'Libia', flag: 'https://flagcdn.com/ly.svg' },
  { code: 'LI', name: 'Liechtenstein', flag: 'https://flagcdn.com/li.svg' },
  { code: 'LT', name: 'Lituania', flag: 'https://flagcdn.com/lt.svg' },
  { code: 'LU', name: 'Luxemburgo', flag: 'https://flagcdn.com/lu.svg' },
  { code: 'MG', name: 'Madagascar', flag: 'https://flagcdn.com/mg.svg' },
  { code: 'MY', name: 'Malasia', flag: 'https://flagcdn.com/my.svg' },
  { code: 'MW', name: 'Malaui', flag: 'https://flagcdn.com/mw.svg' },
  { code: 'MV', name: 'Maldivas', flag: 'https://flagcdn.com/mv.svg' },
  { code: 'ML', name: 'Malí', flag: 'https://flagcdn.com/ml.svg' },
  { code: 'MT', name: 'Malta', flag: 'https://flagcdn.com/mt.svg' },
  { code: 'MA', name: 'Marruecos', flag: 'https://flagcdn.com/ma.svg' },
  { code: 'MR', name: 'Mauritania', flag: 'https://flagcdn.com/mr.svg' },
  { code: 'MU', name: 'Mauricio', flag: 'https://flagcdn.com/mu.svg' },
  { code: 'MX', name: 'México', flag: 'https://flagcdn.com/mx.svg' },
  { code: 'FM', name: 'Micronesia', flag: 'https://flagcdn.com/fm.svg' },
  { code: 'MD', name: 'Moldavia', flag: 'https://flagcdn.com/md.svg' },
  { code: 'MC', name: 'Mónaco', flag: 'https://flagcdn.com/mc.svg' },
  { code: 'MN', name: 'Mongolia', flag: 'https://flagcdn.com/mn.svg' },
  { code: 'ME', name: 'Montenegro', flag: 'https://flagcdn.com/me.svg' },
  { code: 'MZ', name: 'Mozambique', flag: 'https://flagcdn.com/mz.svg' },
  { code: 'NA', name: 'Namibia', flag: 'https://flagcdn.com/na.svg' },
  { code: 'NR', name: 'Nauru', flag: 'https://flagcdn.com/nr.svg' },
  { code: 'NP', name: 'Nepal', flag: 'https://flagcdn.com/np.svg' },
  { code: 'NI', name: 'Nicaragua', flag: 'https://flagcdn.com/ni.svg' },
  { code: 'NE', name: 'Níger', flag: 'https://flagcdn.com/ne.svg' },
  { code: 'NG', name: 'Nigeria', flag: 'https://flagcdn.com/ng.svg' },
  { code: 'NO', name: 'Noruega', flag: 'https://flagcdn.com/no.svg' },
  { code: 'NZ', name: 'Nueva Zelanda', flag: 'https://flagcdn.com/nz.svg' },
  { code: 'OM', name: 'Omán', flag: 'https://flagcdn.com/om.svg' },
  { code: 'NL', name: 'Países Bajos', flag: 'https://flagcdn.com/nl.svg' },
  { code: 'PK', name: 'Pakistán', flag: 'https://flagcdn.com/pk.svg' },
  { code: 'PW', name: 'Palaos', flag: 'https://flagcdn.com/pw.svg' },
  { code: 'PA', name: 'Panamá', flag: 'https://flagcdn.com/pa.svg' },
  {
    code: 'PG',
    name: 'Papúa Nueva Guinea',
    flag: 'https://flagcdn.com/pg.svg'
  },
  { code: 'PY', name: 'Paraguay', flag: 'https://flagcdn.com/py.svg' },
  { code: 'PE', name: 'Perú', flag: 'https://flagcdn.com/pe.svg' },
  { code: 'PL', name: 'Polonia', flag: 'https://flagcdn.com/pl.svg' },
  { code: 'PT', name: 'Portugal', flag: 'https://flagcdn.com/pt.svg' },
  { code: 'GB', name: 'Reino Unido', flag: 'https://flagcdn.com/gb.svg' },
  {
    code: 'CF',
    name: 'República Centroafricana',
    flag: 'https://flagcdn.com/cf.svg'
  },
  { code: 'CZ', name: 'República Checa', flag: 'https://flagcdn.com/cz.svg' },
  {
    code: 'CG',
    name: 'República del Congo',
    flag: 'https://flagcdn.com/cg.svg'
  },
  {
    code: 'CD',
    name: 'República Democrática del Congo',
    flag: 'https://flagcdn.com/cd.svg'
  },
  {
    code: 'DO',
    name: 'República Dominicana',
    flag: 'https://flagcdn.com/do.svg'
  },
  { code: 'RW', name: 'Ruanda', flag: 'https://flagcdn.com/rw.svg' },
  { code: 'RO', name: 'Rumania', flag: 'https://flagcdn.com/ro.svg' },
  { code: 'RU', name: 'Rusia', flag: 'https://flagcdn.com/ru.svg' },
  { code: 'WS', name: 'Samoa', flag: 'https://flagcdn.com/ws.svg' },
  {
    code: 'KN',
    name: 'San Cristóbal y Nieves',
    flag: 'https://flagcdn.com/kn.svg'
  },
  { code: 'SM', name: 'San Marino', flag: 'https://flagcdn.com/sm.svg' },
  {
    code: 'VC',
    name: 'San Vicente y las Granadinas',
    flag: 'https://flagcdn.com/vc.svg'
  },
  { code: 'LC', name: 'Santa Lucía', flag: 'https://flagcdn.com/lc.svg' },
  {
    code: 'ST',
    name: 'Santo Tomé y Príncipe',
    flag: 'https://flagcdn.com/st.svg'
  },
  { code: 'SN', name: 'Senegal', flag: 'https://flagcdn.com/sn.svg' },
  { code: 'RS', name: 'Serbia', flag: 'https://flagcdn.com/rs.svg' },
  { code: 'SC', name: 'Seychelles', flag: 'https://flagcdn.com/sc.svg' },
  { code: 'SL', name: 'Sierra Leona', flag: 'https://flagcdn.com/sl.svg' },
  { code: 'SG', name: 'Singapur', flag: 'https://flagcdn.com/sg.svg' },
  { code: 'SY', name: 'Siria', flag: 'https://flagcdn.com/sy.svg' },
  { code: 'SO', name: 'Somalia', flag: 'https://flagcdn.com/so.svg' },
  { code: 'LK', name: 'Sri Lanka', flag: 'https://flagcdn.com/lk.svg' },
  { code: 'ZA', name: 'Sudáfrica', flag: 'https://flagcdn.com/za.svg' },
  { code: 'SS', name: 'Sudán del Sur', flag: 'https://flagcdn.com/ss.svg' },
  { code: 'SD', name: 'Sudán', flag: 'https://flagcdn.com/sd.svg' },
  { code: 'SE', name: 'Suecia', flag: 'https://flagcdn.com/se.svg' },
  { code: 'CH', name: 'Suiza', flag: 'https://flagcdn.com/ch.svg' },
  { code: 'SR', name: 'Surinam', flag: 'https://flagcdn.com/sr.svg' },
  { code: 'TH', name: 'Tailandia', flag: 'https://flagcdn.com/th.svg' },
  { code: 'TZ', name: 'Tanzania', flag: 'https://flagcdn.com/tz.svg' },
  { code: 'TJ', name: 'Tayikistán', flag: 'https://flagcdn.com/tj.svg' },
  { code: 'TL', name: 'Timor Oriental', flag: 'https://flagcdn.com/tl.svg' },
  { code: 'TG', name: 'Togo', flag: 'https://flagcdn.com/tg.svg' },
  { code: 'TO', name: 'Tonga', flag: 'https://flagcdn.com/to.svg' },
  { code: 'TT', name: 'Trinidad y Tobago', flag: 'https://flagcdn.com/tt.svg' },
  { code: 'TN', name: 'Túnez', flag: 'https://flagcdn.com/tn.svg' },
  { code: 'TM', name: 'Turkmenistán', flag: 'https://flagcdn.com/tm.svg' },
  { code: 'TR', name: 'Turquía', flag: 'https://flagcdn.com/tr.svg' },
  { code: 'TV', name: 'Tuvalu', flag: 'https://flagcdn.com/tv.svg' },
  { code: 'UA', name: 'Ucrania', flag: 'https://flagcdn.com/ua.svg' },
  { code: 'UG', name: 'Uganda', flag: 'https://flagcdn.com/ug.svg' },
  { code: 'UZ', name: 'Uzbekistán', flag: 'https://flagcdn.com/uz.svg' },
  { code: 'VU', name: 'Vanuatu', flag: 'https://flagcdn.com/vu.svg' },
  { code: 'VA', name: 'Vaticano', flag: 'https://flagcdn.com/va.svg' },
  { code: 'VE', name: 'Venezuela', flag: 'https://flagcdn.com/ve.svg' },
  { code: 'VN', name: 'Vietnam', flag: 'https://flagcdn.com/vn.svg' },
  { code: 'YE', name: 'Yemen', flag: 'https://flagcdn.com/ye.svg' },
  { code: 'DJ', name: 'Yibuti', flag: 'https://flagcdn.com/dj.svg' },
  { code: 'ZM', name: 'Zambia', flag: 'https://flagcdn.com/zm.svg' },
  { code: 'ZW', name: 'Zimbabue', flag: 'https://flagcdn.com/zw.svg' }
]

export function CountrySelect ({
  value,
  onChange
}: {
  value: string
  onChange: (v: string) => void
}) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')

  const selected = ALL_COUNTRIES.find(c => c.name === value) ?? null

  const filtered = ALL_COUNTRIES.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase())
  )

  function handleSelect (country: Country) {
    onChange(country.name) // en la BBDD guardás el nombre
    setOpen(false)
    setSearch('')
  }

  return (
    <div className='relative'>
      {/* “Input” visual */}
      <button
        type='button'
        onClick={() => setOpen(o => !o)}
        className='w-full flex items-center justify-between rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500'
      >
        <span className='flex items-center gap-2 truncate'>
          {selected ? (
            <>
              <img
                src={selected.flag}
                alt={selected.name}
                className='h-4 w-6 rounded-sm object-cover'
              />
              <span>{selected.name}</span>
            </>
          ) : (
            <span className='text-slate-500'>Seleccioná un país</span>
          )}
        </span>
        <span className='ml-2 text-xs text-slate-400'>{open ? '▲' : '▼'}</span>
      </button>

      {/* Dropdown */}
      {open && (
        <div className='absolute z-50 mt-2 w-full rounded-lg border border-slate-700 bg-slate-900 shadow-lg'>
          {/* Buscador */}
          <div className='border-b border-slate-800 px-2 py-2'>
            <input
              autoFocus
              type='text'
              placeholder='Buscar país...'
              className='w-full rounded-md border border-slate-700 bg-slate-950 px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500'
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          {/* Lista */}
          <ul className='max-h-56 overflow-y-auto py-1 text-sm'>
            {filtered.length === 0 && (
              <li className='px-3 py-2 text-xs text-slate-400'>
                No se encontraron resultados
              </li>
            )}

            {filtered.map(country => (
              <li key={country.code}>
                <button
                  type='button'
                  onClick={() => handleSelect(country)}
                  className='flex w-full items-center gap-2 px-3 py-2 text-left hover:bg-slate-800'
                >
                  <img
                    src={country.flag}
                    alt={country.name}
                    className='h-4 w-6 rounded-sm object-cover'
                  />
                  <span>{country.name}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
