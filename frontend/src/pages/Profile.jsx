function Profile() {
    const user = JSON.parse(localStorage.getItem("user") || "{}");

    return (
        <div className="profile-page">
            <div className="profile-header">
                <h1>My Profile</h1>
                <p className="text-muted">View your CyberIncident account information.</p>
            </div>

            <div className="profile-grid mt-25">
                <div className="profile-main-column glass-panel">
                    <h3 className="form-section-title">Account Information</h3>

                    <div className="profile-header-info">
                        <div className="profile-avatar-large">
                            {user?.name?.charAt(0)?.toUpperCase()}
                        </div>
                        <div className="profile-name-role">
                            <h2>{user?.name}</h2>
                            <span className={`priority-badge priority-${user?.role?.toLowerCase().replace(' ', '-')}`}>
                                {user?.role}
                            </span>
                        </div>
                    </div>

                    <div className="profile-details-list mt-25">
                        <div className="profile-field">
                            <span className="text-muted">Email Address</span>
                            <strong>{user?.email}</strong>
                        </div>
                        
                        <div className="profile-field">
                            <span className="text-muted">Account Status</span>
                            <strong className="status-active" style={{display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--success)'}}>
                                <span className="incident-dot resolved"></span> Active
                            </strong>
                        </div>
                    </div>
                </div>

                <div className="profile-side-column glass-panel">
                    <h3 className="form-section-title">Security Settings</h3>

                    <div className="security-status-box mt-20">
                        <div className="security-status-item">
                            <span className="incident-dot resolved mr-8"></span>
                            <div className="security-details">
                                <strong>JWT Authentication</strong>
                                <span className="text-muted" style={{display: 'block', fontSize: '0.85rem'}}>Secured session active</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Profile;
