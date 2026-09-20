function Profile() {
    const user = JSON.parse(
        localStorage.getItem("user") || "{}"
    );

    return (
        <div className="profile-page">

            <div className="profile-header">
                <span className="section-label">
                    ACCOUNT
                </span>

                <h1>My Profile</h1>

                <p>
                    View your CyberIncident account information.
                </p>
            </div>

            <div className="profile-card glass-panel">

                <div className="profile-avatar">
                    {user?.name?.charAt(0)?.toUpperCase()}
                </div>

                <div className="profile-info">

                    <div className="profile-field">
                        <span>Name</span>
                        <strong>{user?.name}</strong>
                    </div>

                    <div className="profile-field">
                        <span>Email</span>
                        <strong>{user?.email}</strong>
                    </div>

                    <div className="profile-field">
                        <span>Role</span>
                        <strong>{user?.role}</strong>
                    </div>

                    <div className="profile-field">
                        <span>Account Status</span>
                        <strong className="status-active">
                            ● Active
                        </strong>
                    </div>

                </div>

            </div>

            <div className="security-card glass-panel">

                <div>
                    <span className="section-label">
                        SECURITY
                    </span>

                    <h2>Authentication</h2>
                </div>

                <div className="security-status">
                    <span>●</span>
                    JWT Authentication Active
                </div>

            </div>

        </div>
    );
}

export default Profile;