import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

const RaiseIssueScreen: React.FC = () => {
    const { user } = useAuth();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [isSubmitted, setIsSubmitted] = useState(false);

    useEffect(() => {
        if (user) {
            setName(user.name);
            setEmail(user.email); 
        }
    }, [user]);

    const handleMessageChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        if (e.target.value.length <= 500) {
            setMessage(e.target.value);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const subject = encodeURIComponent('Issue Report from BusTracker Pro User');
        const body = encodeURIComponent(
`Hi BusTracker Pro Support,

A new issue has been reported:

Name: ${name}
Email: ${email}

Message:
----------------
${message}
----------------

Please investigate this issue.

Regards,
BusTracker Pro App`
        );
        
        window.location.href = `mailto:bustrackerpro@gmail.com?subject=${subject}&body=${body}`;
        setIsSubmitted(true);
    };

    if (isSubmitted) {
        return (
            <div className="p-4 h-full flex flex-col items-center justify-center text-center">
                <h2 className="text-2xl font-bold text-neutral-800 dark:text-neutral-100 mb-4">Thank You!</h2>
                <p className="text-neutral-600 dark:text-neutral-400 max-w-sm">
                    Your issue report has been prepared. Please check your default email client to send the message.
                </p>
            </div>
        );
    }

    return (
        <div className="p-4 h-full">
            <div className="max-w-xl mx-auto">
                <p className="text-neutral-600 dark:text-neutral-400 mb-6">
                    Facing an issue? Please fill out the form below. When you submit, your email app will open to send the report to our support team.
                </p>
                <form onSubmit={handleSubmit} className="space-y-6 bg-white dark:bg-neutral-800 p-6 rounded-xl shadow-lg">
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-neutral-600 dark:text-neutral-300 mb-1">Your Name</label>
                        <input
                            type="text"
                            id="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full p-3 border-2 border-neutral-300 dark:border-neutral-600 rounded-lg bg-neutral-100 dark:bg-neutral-700 focus:ring-primary focus:border-primary"
                            required
                        />
                    </div>
                     <div>
                        <label htmlFor="email" className="block text-sm font-medium text-neutral-600 dark:text-neutral-300 mb-1">Your Email</label>
                        <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full p-3 border-2 border-neutral-300 dark:border-neutral-600 rounded-lg bg-neutral-100 dark:bg-neutral-700 focus:ring-primary focus:border-primary"
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="message" className="block text-sm font-medium text-neutral-600 dark:text-neutral-300 mb-1">Describe your issue</label>
                        <textarea
                            id="message"
                            value={message}
                            onChange={handleMessageChange}
                            className="w-full p-3 border-2 border-neutral-300 dark:border-neutral-600 rounded-lg bg-neutral-100 dark:bg-neutral-700 focus:ring-primary focus:border-primary"
                            rows={6}
                            maxLength={500}
                            required
                        />
                        <p className="text-right text-xs text-neutral-500 dark:text-neutral-400 mt-1">{message.length} / 500</p>
                    </div>
                    <button
                        type="submit"
                        className="w-full bg-primary hover:bg-blue-800 text-white font-bold py-3 px-4 rounded-lg transition-colors"
                    >
                        Prepare Email
                    </button>
                </form>
            </div>
        </div>
    );
};

export default RaiseIssueScreen;
