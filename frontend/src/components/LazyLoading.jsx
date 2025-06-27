import React, { Suspense, lazy } from 'react';
import { ErrorBoundary } from 'react-error-boundary';

// Componente de loading personalizado
const LoadingSpinner = ({ size = 'medium', message = 'Cargando...' }) => {
  const sizeClasses = {
    small: 'spinner-border-sm',
    medium: '',
    large: 'spinner-border-lg'
  };

  return (
    <div className="d-flex flex-column align-items-center justify-content-center p-4">
      <div className={`spinner-border text-primary ${sizeClasses[size]}`} role="status">
        <span className="visually-hidden">Loading...</span>
      </div>
      <p className="mt-2 text-muted">{message}</p>
    </div>
  );
};

// Componente de error personalizado
const ErrorFallback = ({ error, resetErrorBoundary }) => {
  return (
    <div className="alert alert-danger m-3" role="alert">
      <h4 className="alert-heading">¡Oops! Algo salió mal</h4>
      <p>Hubo un error al cargar este componente:</p>
      <p className="mb-0">
        <small className="text-muted">{error.message}</small>
      </p>
      <hr />
      <button 
        className="btn btn-primary" 
        onClick={resetErrorBoundary}
      >
        Intentar de nuevo
      </button>
    </div>
  );
};

// HOC para lazy loading con manejo de errores
export const withLazyLoading = (
  importFunc, 
  fallback = <LoadingSpinner />,
  errorFallback = ErrorFallback
) => {
  const LazyComponent = lazy(importFunc);

  return (props) => (
    <ErrorBoundary
      FallbackComponent={errorFallback}
      onError={(error, errorInfo) => {
        console.error('Lazy loading error:', error, errorInfo);
      }}
      onReset={() => {
        // Lógica de reset personalizada si es necesaria
        window.location.reload();
      }}
    >
      <Suspense fallback={fallback}>
        <LazyComponent {...props} />
      </Suspense>
    </ErrorBoundary>
  );
};

// Componentes lazy optimizados para las páginas principales
export const LazyHome = withLazyLoading(
  () => import('../paginas/Home.jsx'),
  <LoadingSpinner message="Cargando página principal..." />
);

export const LazyPacientes = withLazyLoading(
  () => import('../paginas/Pacientes.jsx'),
  <LoadingSpinner message="Cargando pacientes..." />
);

export const LazyConsultas = withLazyLoading(
  () => import('../paginas/Consultas.jsx'),
  <LoadingSpinner message="Cargando consultas..." />
);

export const LazySingUp = withLazyLoading(
  () => import('../paginas/SingUp.jsx'),
  <LoadingSpinner message="Cargando formulario..." />
);

// Componente para preload de rutas
export class RoutePreloader extends React.Component {
  constructor(props) {
    super(props);
    this.preloadedRoutes = new Set();
  }

  preloadRoute = (importFunc) => {
    const routeKey = importFunc.toString();
    if (!this.preloadedRoutes.has(routeKey)) {
      importFunc().catch(error => {
        console.warn('Route preload failed:', error);
      });
      this.preloadedRoutes.add(routeKey);
    }
  };

  componentDidMount() {
    // Preload común de rutas después de que se monte el componente principal
    setTimeout(() => {
      this.preloadRoute(() => import('../paginas/Home.jsx'));
      this.preloadRoute(() => import('../paginas/Pacientes.jsx'));
    }, 2000); // Esperar 2 segundos después del mount
  }

  render() {
    return this.props.children;
  }
}

// Hook para preload on hover
export const usePreloadOnHover = (importFunc) => {
  const [isHovered, setIsHovered] = React.useState(false);
  const preloadedRef = React.useRef(false);

  const handleMouseEnter = React.useCallback(() => {
    setIsHovered(true);
    if (!preloadedRef.current) {
      importFunc().catch(console.warn);
      preloadedRef.current = true;
    }
  }, [importFunc]);

  const handleMouseLeave = React.useCallback(() => {
    setIsHovered(false);
  }, []);

  return {
    onMouseEnter: handleMouseEnter,
    onMouseLeave: handleMouseLeave,
    isHovered
  };
};

export { LoadingSpinner, ErrorFallback };
