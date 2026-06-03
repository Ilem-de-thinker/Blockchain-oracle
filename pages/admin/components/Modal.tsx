import React, { ReactNode } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  showCloseButton?: boolean;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  showCloseButton = true,
}) => {
  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    full: 'max-w-full mx-4',
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-full items-center justify-center p-4">
        <div
          className="fixed inset-0 bg-black/50 transition-opacity"
          onClick={onClose}
        />
        <div
          className={`
            relative bg-surface rounded-2xl shadow-xl w-full ${sizeClasses[size]}
            transform transition-all animate-modal-enter
          `}
        >
          {(title || showCloseButton) && (
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              {title && <h3 className="text-lg font-semibold text-text">{title}</h3>}
              {showCloseButton && (
                <button
                  onClick={onClose}
                  className="p-2 rounded-lg text-gray-400 hover:text-text-secondary hover:bg-surface-hover transition-colors"
                >
                  <i className="fas fa-times text-lg"></i>
                </button>
              )}
            </div>
          )}
          <div className="px-6 py-4">{children}</div>
        </div>
      </div>
    </div>
  );
};

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info';
  loading?: boolean;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'danger',
  loading = false,
}) => {
  const variantClasses = {
    danger: 'bg-red-600 hover:bg-red-700 focus:ring-red-500',
    warning: 'bg-yellow-600 hover:bg-yellow-700 focus:ring-yellow-500',
    info: 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500',
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="sm">
      <div className="text-center">
        <div className="mx-auto w-12 h-12 rounded-full bg-surface-hover flex items-center justify-center mb-4">
          <i className={`fas fa-exclamation-triangle text-xl ${
            variant === 'danger' ? 'text-red-500' : 
            variant === 'warning' ? 'text-yellow-500' : 'text-blue-500'
          }`}></i>
        </div>
        <h3 className="text-lg font-semibold text-text mb-2">{title}</h3>
        <p className="text-text-secondary mb-6">{message}</p>
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 rounded-xl border border-border text-gray-700 font-medium hover:bg-bg transition-colors disabled:opacity-50"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className={`px-4 py-2 rounded-xl text-white font-medium transition-colors focus:ring-2 focus:ring-offset-2 disabled:opacity-50 ${variantClasses[variant]}`}
          >
            {loading ? (
              <i className="fas fa-spinner fa-spin mr-2"></i>
            ) : null}
            {confirmText}
          </button>
        </div>
      </div>
    </Modal>
  );
};
