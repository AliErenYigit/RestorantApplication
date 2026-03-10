import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useAdminSession } from "../../features/admin/context/AdminSessionContext";

const API_BASE_URL = "http://localhost:5041";

type CommentItem = {
  id: number;
  firstName: string;
  lastName: string;
  message: string;
  createdAt: string;
  isApproved?: boolean;
};

type CommentFilter = "all" | "approved" | "pending";

export function AdminCommentsPage() {
  const { adminKey } = useAdminSession();

  const [comments, setComments] = useState<CommentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [approvingId, setApprovingId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [message, setMessage] = useState("");
  const [filter, setFilter] = useState<CommentFilter>("all");

  async function fetchComments() {
    if (!adminKey.trim()) {
      setComments([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setMessage("");

      const response = await axios.get<CommentItem[]>(
        `${API_BASE_URL}/api/admin/comments`,
        {
          headers: {
            "X-Admin-Key": adminKey,
          },
        }
      );

      setComments(response.data ?? []);
    } catch (error) {
      console.error(error);
      setMessage("Yorumlar alınamadı.");
    } finally {
      setLoading(false);
    }
  }

  async function handleApprove(id: number) {
    if (!adminKey.trim()) {
      setMessage("Lütfen önce X-Admin-Key girin.");
      return;
    }

    try {
      setApprovingId(id);
      setMessage("");

      await axios.patch(
        `${API_BASE_URL}/api/admin/comments/${id}/approve`,
        {},
        {
          headers: {
            "X-Admin-Key": adminKey,
          },
        }
      );

      setMessage("Yorum onaylandı.");
      await fetchComments();
    } catch (error) {
      console.error(error);
      setMessage("Yorum onaylanırken hata oluştu.");
    } finally {
      setApprovingId(null);
    }
  }

  async function handleDelete(id: number) {
    if (!adminKey.trim()) {
      setMessage("Lütfen önce X-Admin-Key girin.");
      return;
    }

    const confirmed = window.confirm("Bu yorumu silmek istediğinize emin misiniz?");
    if (!confirmed) {
      return;
    }

    try {
      setDeletingId(id);
      setMessage("");

      await axios.delete(`${API_BASE_URL}/api/admin/comments/${id}`, {
        headers: {
          "X-Admin-Key": adminKey,
        },
      });

      setMessage("Yorum silindi.");
      await fetchComments();
    } catch (error) {
      console.error(error);
      setMessage("Yorum silinirken hata oluştu.");
    } finally {
      setDeletingId(null);
    }
  }

  function formatDate(dateString: string) {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("tr-TR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  }

  const approvedCount = useMemo(
    () => comments.filter((comment) => !!comment.isApproved).length,
    [comments]
  );

  const pendingCount = useMemo(
    () => comments.filter((comment) => !comment.isApproved).length,
    [comments]
  );

  const filteredComments = useMemo(() => {
    if (filter === "approved") {
      return comments.filter((comment) => !!comment.isApproved);
    }

    if (filter === "pending") {
      return comments.filter((comment) => !comment.isApproved);
    }

    return comments;
  }, [comments, filter]);

  useEffect(() => {
    fetchComments();
  }, [adminKey]);

  return (
    <section className="space-y-6">
      <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-bold text-slate-900">Yorumlar</h1>
        <p className="mt-2 text-slate-600">
          Gelen müşteri yorumlarını inceleyin ve onay durumlarını yönetin.
        </p>
      </div>

      <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
        {!adminKey.trim() ? (
          <p className="text-slate-500">Önce üst alandan X-Admin-Key girin.</p>
        ) : loading ? (
          <p className="text-slate-500">Yorumlar yükleniyor...</p>
        ) : (
          <>
            <div className="mb-6 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setFilter("all")}
                className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                  filter === "all"
                    ? "bg-slate-900 text-white"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                Tümü ({comments.length})
              </button>

              <button
                type="button"
                onClick={() => setFilter("approved")}
                className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                  filter === "approved"
                    ? "bg-green-600 text-white"
                    : "bg-green-100 text-green-700 hover:bg-green-200"
                }`}
              >
                Onaylı ({approvedCount})
              </button>

              <button
                type="button"
                onClick={() => setFilter("pending")}
                className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                  filter === "pending"
                    ? "bg-amber-500 text-white"
                    : "bg-amber-100 text-amber-700 hover:bg-amber-200"
                }`}
              >
                Onaysız ({pendingCount})
              </button>
            </div>

            {filteredComments.length === 0 ? (
              <p className="text-slate-500">Bu filtreye uygun yorum bulunamadı.</p>
            ) : (
              <div className="space-y-4">
                {filteredComments.map((comment) => {
                  const approved = !!comment.isApproved;
                  const isApprovingThis = approvingId === comment.id;
                  const isDeletingThis = deletingId === comment.id;
                  const isBusy = isApprovingThis || isDeletingThis;

                  return (
                    <div
                      key={comment.id}
                      className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
                    >
                      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                        <div className="flex-1">
                          <div className="flex flex-wrap items-center gap-3">
                            <h3 className="text-lg font-semibold text-slate-900">
                              {comment.firstName} {comment.lastName}
                            </h3>

                            <span
                              className={`rounded-full px-3 py-1 text-xs font-semibold ${
                                approved
                                  ? "bg-green-100 text-green-700"
                                  : "bg-amber-100 text-amber-700"
                              }`}
                            >
                              {approved ? "Onaylandı" : "Onaysız"}
                            </span>
                          </div>

                          <p className="mt-3 text-sm leading-6 text-slate-600">
                            {comment.message}
                          </p>

                          <p className="mt-3 text-xs text-slate-400">
                            {formatDate(comment.createdAt)}
                          </p>

                          <div className="mt-3">
                            <span className="rounded-full bg-slate-100 px-2 py-1 text-xs text-slate-500">
                              ID: {comment.id}
                            </span>
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                          {!approved && (
                            <button
                              type="button"
                              onClick={() => handleApprove(comment.id)}
                              disabled={isBusy || approvingId !== null || deletingId !== null}
                              className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                              {isApprovingThis ? "Onaylanıyor..." : "Onayla"}
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() => handleDelete(comment.id)}
                            disabled={isBusy || approvingId !== null || deletingId !== null}
                            className="rounded-xl bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            {isDeletingThis ? "Siliniyor..." : "Sil"}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}

        {message ? (
          <div className="mt-5 rounded-2xl bg-slate-100 px-4 py-3 text-sm text-slate-700">
            {message}
          </div>
        ) : null}
      </div>
    </section>
  );
}