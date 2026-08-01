package com.jirolite.workspace.repository;

import com.jirolite.auth.entity.User;
import com.jirolite.workspace.entity.Workspace;
import com.jirolite.workspace.entity.WorkspaceMember;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface WorkspaceMemberRepository extends JpaRepository<WorkspaceMember, UUID> {
    List<WorkspaceMember> findByWorkspaceId(UUID workspaceId);
    List<WorkspaceMember> findByUser(User user);
    Optional<WorkspaceMember> findByWorkspaceAndUser(Workspace workspace, User user);
    boolean existsByWorkspaceIdAndUserId(UUID workspaceId, UUID userId);
    void deleteByWorkspaceId(UUID workspaceId);
}
