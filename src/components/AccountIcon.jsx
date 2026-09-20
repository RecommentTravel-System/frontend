export default function Icon({ name, ...props }) {
  const paths = {
    user: 'M20 21v-2a7 7 0 0 0-14 0v2M16 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z',
    card: 'M3 8h18M3 13h5M3 17h3M3 4h18v16H3Z',
    calendar: 'M8 2v4M16 2v4M3 9h18M3 4h18v17H3ZM7 13h3M14 13h3M7 17h3',
    heart: 'M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z',
    support: 'M4 14v-3a8 8 0 0 1 16 0v6h-4v-7h4M4 10h4v7H4ZM20 17c0 4-4 4-8 4',
    review: 'M4 3h16v14H9l-5 4ZM8 7h8M8 11h6',
    settings: 'm12 2 3 2 4 1 1 4 2 3-2 3-1 4-4 1-3 2-3-2-4-1-1-4-2-3 2-3 1-4 4-1ZM16 12a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z',
    logout: 'M9 3H3v18h6M9 12h12m-4-4 4 4-4 4',
    camera: 'M3 6h4l2-3h6l2 3h4v15H3ZM16 13a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z',
    mail: 'M3 5h18v14H3ZM3 5l9 7 9-7',
    chevron: 'm8 10 4 4 4-4',
  };
  return <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}><path d={paths[name] || paths.user} /></svg>;
}

