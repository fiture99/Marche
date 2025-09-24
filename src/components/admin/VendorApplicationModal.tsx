import React, { useState, useEffect, Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import {
  XMarkIcon,
  CheckIcon,
  XCircleIcon,
  UserIcon,
  BuildingStorefrontIcon,
  MapPinIcon,
  EnvelopeIcon,
  PhoneIcon,
  DocumentIcon,
} from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';

interface VendorApplication {
  id: number;
  name: string;
  email: string;
  phone: string;
  businessName: string;
  businessDescription: string;
  category: string;
  location: string;
  status: 'pending' | 'approved' | 'rejected';
  appliedDate: string;
  documents?: string[];
}

interface VendorApplicationModalProps {
  isOpen: boolean;
  onClose: () => void;
  application: VendorApplication | null;
  onApprove: (id: number) => void;
  onReject: (id: number, reason: string) => void;
}

const VendorApplicationModal: React.FC<VendorApplicationModalProps> = ({
  isOpen,
  onClose,
  application,
  onApprove,
  onReject,
}) => {
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [loading, setLoading] = useState(false);

  // Reset reject form whenever modal opens
  useEffect(() => {
    if (isOpen) {
      setRejectReason('');
      setShowRejectForm(false);
    }
  }, [isOpen]);

  const handleApprove = async () => {
    if (!application) return;
    setLoading(true);
    try {
      await onApprove(application.id);
      onClose();
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async () => {
    if (!application || !rejectReason.trim()) return;
    setLoading(true);
    try {
      await onReject(application.id, rejectReason);
      onClose();
    } finally {
      setLoading(false);
      setRejectReason('');
      setShowRejectForm(false);
    }
  };

  if (!application) return null;

  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel
                className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-2xl sm:p-6"
                aria-modal="true"
              >
                <div className="absolute right-0 top-0 hidden pr-4 pt-4 sm:block">
                  <button
                    type="button"
                    className="rounded-md bg-white text-gray-400 hover:text-gray-500"
                    onClick={onClose}
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </div>

                <div className="sm:flex sm:items-start">
                  <div className="w-full">
                    <Dialog.Title
                      as="h3"
                      className="text-lg font-semibold leading-6 text-gray-900 mb-6"
                    >
                      Vendor Application Review
                    </Dialog.Title>

                    <div className="space-y-6">
                      {/* Personal Information */}
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                          <UserIcon className="w-5 h-5 mr-2" />
                          Personal Information
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700">
                              Full Name
                            </label>
                            <p className="mt-1 text-sm text-gray-900">{application.name}</p>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700">
                              Email
                            </label>
                            <p className="mt-1 text-sm text-gray-900 flex items-center">
                              <EnvelopeIcon className="w-4 h-4 mr-1" />
                              {application.email}
                            </p>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700">
                              Phone
                            </label>
                            <p className="mt-1 text-sm text-gray-900 flex items-center">
                              <PhoneIcon className="w-4 h-4 mr-1" />
                              {application.phone}
                            </p>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700">
                              Location
                            </label>
                            <p className="mt-1 text-sm text-gray-900 flex items-center">
                              <MapPinIcon className="w-4 h-4 mr-1" />
                              <a
                                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                                  application.location
                                )}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:underline"
                              >
                                {application.location}
                              </a>
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Business Information */}
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                          <BuildingStorefrontIcon className="w-5 h-5 mr-2" />
                          Business Information
                        </h4>
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700">
                              Business Name
                            </label>
                            <p className="mt-1 text-sm text-gray-900">{application.businessName}</p>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700">
                              Category
                            </label>
                            <p className="mt-1 text-sm text-gray-900">{application.category}</p>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700">
                              Business Description
                            </label>
                            <p className="mt-1 text-sm text-gray-900">{application.businessDescription}</p>
                          </div>
                        </div>
                      </div>

                      {/* Documents */}
                      {application.documents?.length > 0 && (
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                            <DocumentIcon className="w-5 h-5 mr-2" />
                            Documents
                          </h4>
                          <ul className="list-disc list-inside text-sm text-gray-900">
                            {application.documents.map((doc, idx) => (
                              <li key={idx}>
                                <a
                                  href={doc}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-600 hover:underline"
                                >
                                  Document {idx + 1}
                                </a>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Application Details */}
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="font-medium text-gray-900 mb-3">Application Details</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700">
                              Applied Date
                            </label>
                            <p className="mt-1 text-sm text-gray-900">
                              {new Date(application.appliedDate).toLocaleDateString()}
                            </p>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700">
                              Status
                            </label>
                            <span
                              className={`mt-1 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                application.status === 'pending'
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : application.status === 'approved'
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-red-100 text-red-800'
                              }`}
                            >
                              {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Reject Form */}
                      {showRejectForm && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="bg-red-50 p-4 rounded-lg border border-red-200"
                        >
                          <label className="block text-sm font-medium text-red-700 mb-2">
                            Rejection Reason
                          </label>
                          <textarea
                            value={rejectReason}
                            onChange={(e) => setRejectReason(e.target.value)}
                            rows={3}
                            className="w-full px-3 py-2 border border-red-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500"
                            placeholder="Please provide a reason for rejection..."
                          />
                        </motion.div>
                      )}
                    </div>

                    {/* Actions */}
                    {application.status === 'pending' && (
                      <div className="mt-6 flex flex-col sm:flex-row gap-3">
                        {!showRejectForm ? (
                          <>
                            <button
                              onClick={handleApprove}
                              disabled={loading}
                              className="flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                              <CheckIcon className="w-4 h-4 mr-2" />
                              {loading ? 'Approving...' : 'Approve Application'}
                            </button>
                            <button
                              onClick={() => setShowRejectForm(true)}
                              className="flex items-center justify-center px-4 py-2 border border-red-300 text-red-700 rounded-md hover:bg-red-50 transition-colors"
                            >
                              <XCircleIcon className="w-4 h-4 mr-2" />
                              Reject Application
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={handleReject}
                              disabled={loading || !rejectReason.trim()}
                              className="flex items-center justify-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                              <XCircleIcon className="w-4 h-4 mr-2" />
                              {loading ? 'Rejecting...' : 'Confirm Rejection'}
                            </button>
                            <button
                              onClick={() => {
                                setShowRejectForm(false);
                                setRejectReason('');
                              }}
                              className="flex items-center justify-center px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                            >
                              Cancel
                            </button>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
};

export default VendorApplicationModal;
