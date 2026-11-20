// Selector segmentado de ciudad: radios nativos (teclado y lector de pantalla gratis).
export function CitySwitcher({ cities, value, onChange }) {
  return (
    <fieldset className="flex rounded-lg bg-paper p-1 ring-1 ring-line">
      <legend className="sr-only">Ciudad</legend>
      {cities.map((city) => (
        <label
          key={city.id}
          className="cursor-pointer rounded-md px-3 py-2 text-sm font-medium text-ink-2 transition-colors duration-150 has-[:checked]:bg-surface has-[:checked]:text-ink has-[:checked]:shadow-sm has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-accent"
        >
          <input type="radio" name="city" value={city.id} checked={value === city.id} onChange={() => onChange(city.id)} className="sr-only" />
          {city.name}
        </label>
      ))}
    </fieldset>
  );
}
