// Pure-SVG charts — CarthaVillage Mediterranean palette
const LineChart = ({ data, w=720, h=220, color='#1B4F72', fill=true, axis=true, label='' }) => {
  const pad = { l: 36, r: 16, t: 18, b: 26 };
  const W = w - pad.l - pad.r, H = h - pad.t - pad.b;
  const ys = data.map(d=>d.v);
  const min = Math.min(...ys) - 2;
  const max = Math.max(...ys) + 2;
  const x = i => pad.l + (i/(data.length-1)) * W;
  const y = v => pad.t + H - ((v-min)/(max-min)) * H;
  const path = data.map((d,i)=> (i===0?'M':'L') + x(i)+' '+y(d.v)).join(' ');
  const area = path + ` L${x(data.length-1)} ${pad.t+H} L${x(0)} ${pad.t+H} Z`;
  const ticks = [min, (min+max)/2, max].map(v => Math.round(v));
  return (
    <svg width="100%" viewBox={`0 0 ${w} ${h}`} className="block">
      {/* y grid */}
      {axis && ticks.map((t,i)=>(
        <g key={i}>
          <line x1={pad.l} x2={w-pad.r} y1={y(t)} y2={y(t)} stroke="#D6D1C7" strokeWidth="0.6" strokeDasharray="2 3"/>
          <text x={pad.l-8} y={y(t)+3} fontSize="10" textAnchor="end" fill="#6B7A8D" fontFamily="JetBrains Mono">{t}</text>
        </g>
      ))}
      {/* x labels */}
      {axis && data.filter((_,i)=>i%4===0 || i===data.length-1).map((d,i)=>(
        <text key={i} x={x(data.indexOf(d))} y={h-8} fontSize="10" textAnchor="middle" fill="#6B7A8D" fontFamily="JetBrains Mono">{d.wk}</text>
      ))}
      {fill && <path d={area} fill={color} opacity="0.06"/>}
      <path d={path} fill="none" stroke={color} strokeWidth="1.5"/>
      {/* end dot */}
      <circle cx={x(data.length-1)} cy={y(data[data.length-1].v)} r="3.5" fill={color}/>
      <circle cx={x(data.length-1)} cy={y(data[data.length-1].v)} r="6" fill="none" stroke={color} strokeWidth="0.6"/>
      {label && <text x={pad.l} y={pad.t-4} fontSize="10" fill="#6B7A8D" fontFamily="JetBrains Mono">{label.toUpperCase()}</text>}
    </svg>
  );
};

const Sparkline = ({ data, w=120, h=28, color='#1B4F72' }) => {
  if (!data?.length) return null;
  const ys = data.map(d=>d.v);
  const min = Math.min(...ys), max = Math.max(...ys);
  const x = i => (i/(data.length-1)) * w;
  const y = v => h - ((v-min)/((max-min)||1)) * (h-4) - 2;
  const path = data.map((d,i)=> (i===0?'M':'L') + x(i)+' '+y(d.v)).join(' ');
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="block">
      <path d={path} fill="none" stroke={color} strokeWidth="1.2"/>
      <circle cx={x(data.length-1)} cy={y(data[data.length-1].v)} r="2" fill={color}/>
    </svg>
  );
};

const BarChart = ({ data, w=720, h=220, color='#1B4F72' }) => {
  const pad = { l: 36, r: 16, t: 18, b: 36 };
  const W = w - pad.l - pad.r, H = h - pad.t - pad.b;
  const max = 100;
  const bw = (W / data.length) * 0.6;
  const gap = (W / data.length) * 0.4;
  return (
    <svg width="100%" viewBox={`0 0 ${w} ${h}`} className="block">
      {[0,50,100].map((t,i)=>(
        <g key={i}>
          <line x1={pad.l} x2={w-pad.r} y1={pad.t + H - (t/max)*H} y2={pad.t + H - (t/max)*H} stroke="#D6D1C7" strokeDasharray="2 3" strokeWidth="0.6"/>
          <text x={pad.l-8} y={pad.t + H - (t/max)*H + 3} fontSize="10" textAnchor="end" fill="#6B7A8D" fontFamily="JetBrains Mono">{t}</text>
        </g>
      ))}
      {data.map((d,i)=>{
        const xx = pad.l + i*(bw+gap) + gap/2;
        const hh = (d.value/max) * H;
        const barColor = d.value>=88 ? '#1E8449' : d.value>=80 ? '#1B4F72' : '#D4AC0D';
        return (
          <g key={i}>
            <rect x={xx} y={pad.t + H - hh} width={bw} height={hh} fill={barColor} rx="2" opacity={d.value>85?1:0.85}/>
            <text x={xx+bw/2} y={h-18} fontSize="10" textAnchor="middle" fill="#2A3441">{d.name}</text>
            <text x={xx+bw/2} y={h-6} fontSize="10" textAnchor="middle" fill="#6B7A8D" fontFamily="JetBrains Mono">{d.value}</text>
          </g>
        );
      })}
    </svg>
  );
};

const Ring = ({ value, max=100, size=72, stroke=6, color='#C5933A', label }) => {
  const r = (size - stroke)/2;
  const c = 2 * Math.PI * r;
  const off = c - (value/max)*c;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#D6D1C7" strokeWidth={stroke}/>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={stroke} strokeDasharray={c} strokeDashoffset={off} strokeLinecap="round" transform={`rotate(-90 ${size/2} ${size/2})`}/>
      <text x={size/2} y={size/2+1} fontSize="14" textAnchor="middle" dominantBaseline="middle" fontFamily="JetBrains Mono" fontWeight="600" fill="#0F1923">{value}</text>
      {label && <text x={size/2} y={size/2+14} fontSize="8" textAnchor="middle" dominantBaseline="middle" fill="#6B7A8D">{label}</text>}
    </svg>
  );
};

const Bar = ({ value, max=100, color='#1B4F72', height=4 }) => (
  <div className="w-full bg-rule rounded-full overflow-hidden" style={{ height }}>
    <div style={{ width: `${(value/max)*100}%`, background: color, height: '100%' }} className="rounded-full transition-all duration-500"/>
  </div>
);

Object.assign(window, { LineChart, BarChart, Sparkline, Ring, Bar });
