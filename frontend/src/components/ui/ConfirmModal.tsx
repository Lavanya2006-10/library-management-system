import React from 'react';
import { AlertTriangle, Trash2, HelpCircle } from 'lucide-react';
import { Modal } from './Modal';
import { Button } from './Button';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title: string;
  message: React.ReactNode;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'primary';
  isLoading?: boolean;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'danger',
  isLoading = false,
}) => {
  const iconMap = {
    danger: <Trash2 className="w-6 h-6 text-rose-600 dark:text-rose-400" />,
    warning: <AlertTriangle className="w-6 h-6 text-amber-600 dark:text-amber-400" />,
    primary: <HelpCircle className="w-6 h-6 text-blue-600 dark:text-blue-400" />,
  };

  const bgMap = {
    danger: 'bg-rose-50 dark:bg-rose-950/50',
    warning: 'bg-amber-50 dark:bg-amber-950/50',
    primary: 'bg-blue-50 dark:bg-blue-950/50',
  };

  const buttonVariantMap: Record<'danger' | 'warning' | 'primary', 'danger' | 'primary' | 'outline'> = {
    danger: 'danger',
    warning: 'primary',
    primary: 'primary',
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title=""
      maxWidth="sm"
      footer={
        <div className="flex items-center justify-end gap-3 w-full">
          <Button variant="outline" size="sm" onClick={onClose} disabled={isLoading}>
            {cancelText}
          </Button>
          <Button
            variant={buttonVariantMap[variant]}
            size="sm"
            onClick={onConfirm}
            isLoading={isLoading}
          >
            {confirmText}
          </Button>
        </div>
      }
    >
      <div className="flex items-start gap-4">
        <div
          className={`w-12 h-12 rounded-2xl ${bgMap[variant]} flex items-center justify-center flex-shrink-0`}
        >
          {iconMap[variant]}
        </div>
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">{title}</h3>
          <div className="text-xs text-slate-600 dark:text-slate-400 mt-1.5 leading-relaxed">
            {message}
          </div>
        </div>
      </div>
    </Modal>
  );
};
