package com.jirolite.workspace.service;

import com.jirolite.auth.entity.User;
import com.jirolite.auth.repository.UserRepository;
import com.jirolite.common.exception.UnauthorizedException;
import com.jirolite.common.exception.UserNotFoundException;
import com.jirolite.common.exception.WorkspaceNotFoundException;
import com.jirolite.workspace.dto.WorkspaceDtos.InviteMemberRequest;
import com.jirolite.workspace.dto.WorkspaceDtos.WorkspaceMemberResponse;
import com.jirolite.workspace.dto.WorkspaceDtos.WorkspaceRequest;
import com.jirolite.workspace.dto.WorkspaceDtos.WorkspaceResponse;
import com.jirolite.workspace.entity.Workspace;
import com.jirolite.workspace.entity.WorkspaceMember;
import com.jirolite.workspace.entity.WorkspaceRole;
import com.jirolite.workspace.repository.WorkspaceMemberRepository;
import com.jirolite.workspace.repository.WorkspaceRepository;
import java.util.List;
import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class WorkspaceService {
    private final WorkspaceRepository workspaceRepository;
    private final WorkspaceMemberRepository memberRepository;
    private final UserRepository userRepository;

    public WorkspaceService(WorkspaceRepository workspaceRepository, WorkspaceMemberRepository memberRepository, UserRepository userRepository) {
        this.workspaceRepository = workspaceRepository;
        this.memberRepository = memberRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public WorkspaceResponse create(WorkspaceRequest request, String email) {
        User owner = currentUser(email);
        Workspace workspace = workspaceRepository.save(Workspace.builder()
                .name(request.name())
                .description(request.description())
                .owner(owner)
                .build());
        memberRepository.save(WorkspaceMember.builder().workspace(workspace).user(owner).role(WorkspaceRole.ADMIN).build());
        return toResponse(workspace);
    }

    @Transactional(readOnly = true)
    public List<WorkspaceResponse> myWorkspaces(String email) {
        User user = currentUser(email);
        return memberRepository.findByUser(user).stream().map(member -> toResponse(member.getWorkspace())).toList();
    }

    @Transactional
    public WorkspaceResponse update(UUID id, WorkspaceRequest request, String email) {
        Workspace workspace = getWorkspace(id);
        requireAdmin(workspace, email);
        workspace.setName(request.name());
        workspace.setDescription(request.description());
        return toResponse(workspaceRepository.save(workspace));
    }

    @Transactional
    public void delete(UUID id, String email) {
        Workspace workspace = getWorkspace(id);
        requireAdmin(workspace, email);
        memberRepository.deleteByWorkspaceId(id);
        workspaceRepository.delete(workspace);
    }

    @Transactional
    public WorkspaceMemberResponse invite(UUID workspaceId, InviteMemberRequest request, String email) {
        Workspace workspace = getWorkspace(workspaceId);
        requireAdmin(workspace, email);
        User user = userRepository.findByEmailIgnoreCase(request.email()).orElseThrow(UserNotFoundException::new);
        if (memberRepository.existsByWorkspaceIdAndUserId(workspaceId, user.getId())) {
            throw new IllegalArgumentException("User is already a workspace member");
        }
        WorkspaceMember member = memberRepository.save(WorkspaceMember.builder()
                .workspace(workspace)
                .user(user)
                .role(request.role() == null ? WorkspaceRole.MEMBER : request.role())
                .build());
        return toMemberResponse(member);
    }

    @Transactional(readOnly = true)
    public List<WorkspaceMemberResponse> listMembers(UUID workspaceId, String email) {
        Workspace workspace = getWorkspace(workspaceId);
        requireMember(workspace, email);
        return memberRepository.findByWorkspaceId(workspaceId).stream().map(this::toMemberResponse).toList();
    }

    public Workspace getWorkspace(UUID id) {
        return workspaceRepository.findById(id).orElseThrow(WorkspaceNotFoundException::new);
    }

    public void requireMember(Workspace workspace, String email) {
        User user = currentUser(email);
        if (!memberRepository.existsByWorkspaceIdAndUserId(workspace.getId(), user.getId())) {
            throw new UnauthorizedException("Workspace access denied");
        }
    }

    private void requireAdmin(Workspace workspace, String email) {
        User user = currentUser(email);
        WorkspaceMember member = memberRepository.findByWorkspaceAndUser(workspace, user)
                .orElseThrow(() -> new UnauthorizedException("Workspace access denied"));
        if (member.getRole() != WorkspaceRole.ADMIN) {
            throw new UnauthorizedException("Workspace admin role required");
        }
    }

    private User currentUser(String email) {
        return userRepository.findByEmailIgnoreCase(email).orElseThrow(UserNotFoundException::new);
    }

    private WorkspaceResponse toResponse(Workspace workspace) {
        return new WorkspaceResponse(workspace.getId(), workspace.getName(), workspace.getDescription(), workspace.getOwner().getId(), workspace.getCreatedAt());
    }

    private WorkspaceMemberResponse toMemberResponse(WorkspaceMember member) {
        User user = member.getUser();
        return new WorkspaceMemberResponse(member.getId(), user.getId(), user.getName(), user.getEmail(), member.getRole());
    }
}
