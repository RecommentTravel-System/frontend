import { filterGroups, selectedValues } from './searchData.js';

export default function SearchFilters({ params, onChange, onClear }) {
  function toggle(key, value) {
    const selected = selectedValues(params, key);
    onChange(key, selected.includes(value) ? selected.filter(item => item !== value) : [...selected, value]);
  }
  function option(key, value, label) {
    return <label key={value} className="search-filter-option"><input type="checkbox" checked={selectedValues(params, key).includes(value)} onChange={() => toggle(key, value)} /><span>{label}</span></label>;
  }
  return <aside className="search-filters" aria-label="Bộ lọc tìm kiếm"><div className="search-filter-heading"><strong>Filter by:</strong><button type="button" onClick={onClear}>Clear</button></div>
    <details open><summary>Rooms and Beds</summary><div className="search-counters">{[['bedrooms', 'Bedrooms'], ['beds', 'Beds'], ['bathrooms', 'Bathrooms']].map(([key, label]) => { const value = Math.min(10, Math.max(0, Number(params.get(key)) || 0)); return <div key={key}><span>{label}</span><div><button type="button" aria-label={`Giảm ${label}`} disabled={value === 0} onClick={() => onChange(key, value - 1 || '')}>−</button><output aria-live="polite">{value || 'Any'}</output><button type="button" aria-label={`Tăng ${label}`} disabled={value === 10} onClick={() => onChange(key, value + 1)}>+</button></div></div>; })}</div></details>
    <details open><summary>Room Size</summary>{[['small', 'Small (≤ 25 m²)'], ['medium', 'Medium (26–40 m²)'], ['large', 'Large (> 40 m²)']].map(([value, label]) => option('size', value, label))}</details>
    <details open><summary>Distance From Centre</summary><div className="search-range-label"><span>0 km</span><output>{params.get('distance') || 10} km</output></div><input className="search-distance" type="range" min="0" max="10" step="0.5" value={params.get('distance') || 10} onChange={event => onChange('distance', event.target.value)} aria-label="Khoảng cách tối đa từ trung tâm" /></details>
    <details open><summary>Guest Review Score</summary>{[['5', '5.0 Excellent'], ['4', '4.0+ Very good'], ['3', '3.0+ Good'], ['2', '2.0+ Fair'], ['1', '1.0+ Poor']].map(([value, label]) => option('score', value, label))}</details>
    <details open><summary>Property Classification</summary>{[5, 4, 3, 2, 1, 0].map(value => option('stars', String(value), <><span className="search-stars" aria-hidden="true">{'★'.repeat(value)}{'☆'.repeat(5 - value)}</span> {value ? `${value}-Star` : 'No rating'}</>))}</details>
    {filterGroups.map(group => <details key={group.key} open={group.key === 'amenities'}><summary>{group.title}</summary><div className={group.chips ? 'search-filter-chips' : ''}>{group.options.map(value => option(group.key, value, value))}</div></details>)}
  </aside>;
}
