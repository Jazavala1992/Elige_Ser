import React, { useState, useRef, useEffect } from 'react';
import { useIntersectionObserver } from '../hooks/useOptimizations.js';

const OptimizedImage = ({ 
  src, 
  alt, 
  className = '', 
  placeholder = '/api/placeholder/400/300',
  lazy = true,
  blurDataURL,
  quality = 80,
  ...props 
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [currentSrc, setCurrentSrc] = useState(lazy ? placeholder : src);
  const imgRef = useRef(null);

  // Intersection Observer para lazy loading
  const [setNode, entry] = useIntersectionObserver({
    threshold: 0.1,
    rootMargin: '50px'
  });

  useEffect(() => {
    if (lazy) {
      setNode(imgRef.current);
    }
  }, [setNode, lazy]);

  useEffect(() => {
    if (lazy && entry?.isIntersecting && currentSrc === placeholder) {
      setCurrentSrc(src);
    }
  }, [entry, lazy, src, currentSrc, placeholder]);

  const handleLoad = () => {
    setIsLoaded(true);
    setHasError(false);
  };

  const handleError = () => {
    setHasError(true);
    setIsLoaded(false);
    // Fallback a placeholder en caso de error
    if (currentSrc !== placeholder) {
      setCurrentSrc(placeholder);
    }
  };

  const imgClassName = `
    ${className}
    ${!isLoaded ? 'opacity-50' : 'opacity-100'}
    transition-opacity duration-300
  `.trim();

  return (
    <div className="position-relative">
      {/* Blur placeholder mientras carga */}
      {blurDataURL && !isLoaded && (
        <img
          src={blurDataURL}
          alt=""
          className={`position-absolute top-0 start-0 w-100 h-100 ${className}`}
          style={{ 
            filter: 'blur(10px)',
            transform: 'scale(1.1)',
            zIndex: 1
          }}
        />
      )}
      
      <img
        ref={imgRef}
        src={currentSrc}
        alt={alt}
        className={imgClassName}
        onLoad={handleLoad}
        onError={handleError}
        loading={lazy ? 'lazy' : 'eager'}
        style={{ 
          zIndex: 2,
          position: 'relative'
        }}
        {...props}
      />
      
      {/* Indicador de carga */}
      {!isLoaded && !hasError && currentSrc !== placeholder && (
        <div 
          className="position-absolute top-50 start-50 translate-middle"
          style={{ zIndex: 3 }}
        >
          <div className="spinner-border spinner-border-sm text-primary" role="status">
            <span className="visually-hidden">Cargando imagen...</span>
          </div>
        </div>
      )}
      
      {/* Mensaje de error */}
      {hasError && (
        <div 
          className="position-absolute top-50 start-50 translate-middle text-center"
          style={{ zIndex: 3 }}
        >
          <div className="text-muted">
            <i className="bi bi-image-fill fs-1 d-block mb-2"></i>
            <small>Error al cargar imagen</small>
          </div>
        </div>
      )}
    </div>
  );
};

// Componente de avatar optimizado
export const OptimizedAvatar = ({ 
  src, 
  alt, 
  size = 'md',
  className = '',
  initials,
  ...props 
}) => {
  const [hasError, setHasError] = useState(false);
  
  const sizeClasses = {
    sm: 'width: 32px; height: 32px;',
    md: 'width: 48px; height: 48px;',
    lg: 'width: 64px; height: 64px;',
    xl: 'width: 96px; height: 96px;'
  };

  const handleError = () => {
    setHasError(true);
  };

  if (hasError || !src) {
    return (
      <div
        className={`
          rounded-circle bg-primary text-white d-flex align-items-center justify-content-center
          ${className}
        `}
        style={sizeClasses[size]}
        {...props}
      >
        {initials || alt?.charAt(0)?.toUpperCase() || '?'}
      </div>
    );
  }

  return (
    <OptimizedImage
      src={src}
      alt={alt}
      className={`rounded-circle ${className}`}
      style={sizeClasses[size]}
      onError={handleError}
      {...props}
    />
  );
};

// Hook para generar URLs de imagen optimizada
export const useOptimizedImageUrl = (src, options = {}) => {
  const { width, height, quality = 80, format = 'webp' } = options;
  
  return React.useMemo(() => {
    if (!src) return null;
    
    // Si es una imagen externa, devolverla tal como está
    if (src.startsWith('http')) {
      return src;
    }
    
    // Para imágenes locales, podríamos implementar un servicio de optimización
    // Por ahora, devolvemos la URL original
    return src;
  }, [src, width, height, quality, format]);
};

// Componente de galería con lazy loading
export const ImageGallery = ({ images = [], className = '' }) => {
  const [selectedImage, setSelectedImage] = useState(null);

  const handleImageClick = (image, index) => {
    setSelectedImage({ ...image, index });
  };

  const handleCloseModal = () => {
    setSelectedImage(null);
  };

  const handlePrevImage = () => {
    if (selectedImage && selectedImage.index > 0) {
      const prevIndex = selectedImage.index - 1;
      setSelectedImage({ ...images[prevIndex], index: prevIndex });
    }
  };

  const handleNextImage = () => {
    if (selectedImage && selectedImage.index < images.length - 1) {
      const nextIndex = selectedImage.index + 1;
      setSelectedImage({ ...images[nextIndex], index: nextIndex });
    }
  };

  return (
    <>
      <div className={`row g-2 ${className}`}>
        {images.map((image, index) => (
          <div key={index} className="col-6 col-md-4 col-lg-3">
            <div 
              className="card h-100 cursor-pointer"
              onClick={() => handleImageClick(image, index)}
            >
              <OptimizedImage
                src={image.src}
                alt={image.alt || `Imagen ${index + 1}`}
                className="card-img-top"
                style={{ height: '200px', objectFit: 'cover' }}
              />
              {image.caption && (
                <div className="card-body p-2">
                  <p className="card-text small text-muted mb-0">
                    {image.caption}
                  </p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Modal para imagen ampliada */}
      {selectedImage && (
        <div 
          className="modal fade show d-block" 
          tabIndex="-1"
          style={{ backgroundColor: 'rgba(0,0,0,0.8)' }}
          onClick={handleCloseModal}
        >
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content bg-transparent border-0">
              <div className="position-relative">
                <OptimizedImage
                  src={selectedImage.src}
                  alt={selectedImage.alt}
                  className="w-100"
                  style={{ maxHeight: '80vh', objectFit: 'contain' }}
                  onClick={(e) => e.stopPropagation()}
                />
                
                {/* Botón cerrar */}
                <button
                  type="button"
                  className="btn-close btn-close-white position-absolute top-0 end-0 m-3"
                  onClick={handleCloseModal}
                ></button>
                
                {/* Navegación */}
                {selectedImage.index > 0 && (
                  <button
                    type="button"
                    className="btn btn-light position-absolute top-50 start-0 translate-middle-y ms-3"
                    onClick={handlePrevImage}
                  >
                    <i className="bi bi-chevron-left"></i>
                  </button>
                )}
                
                {selectedImage.index < images.length - 1 && (
                  <button
                    type="button"
                    className="btn btn-light position-absolute top-50 end-0 translate-middle-y me-3"
                    onClick={handleNextImage}
                  >
                    <i className="bi bi-chevron-right"></i>
                  </button>
                )}
                
                {/* Caption */}
                {selectedImage.caption && (
                  <div className="position-absolute bottom-0 start-0 w-100 bg-dark bg-opacity-75 text-white p-3">
                    <p className="mb-0">{selectedImage.caption}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default OptimizedImage;
